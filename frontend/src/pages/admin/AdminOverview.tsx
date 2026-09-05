import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Shield, Users, Mail, AlertTriangle, Cpu, Server, Activity, TrendingUp, Eye, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  emailsScanned: number;
  threatsDetected: number;
  criticalThreats: number;
  detectionRate: number;
}

interface SystemStatus {
  service: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  latency: number;
  uptime: number;
  lastChecked: string;
}

interface RecentActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
}

interface ThreatData {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  target: string;
  timestamp: string;
}

const mockMetrics: AdminMetrics = {
  totalUsers: 1284,
  activeUsers: 942,
  emailsScanned: 48200000,
  threatsDetected: 12503,
  criticalThreats: 342,
  detectionRate: 98.7,
};

const mockSystemStatus: SystemStatus[] = [
  { service: 'API', status: 'OPERATIONAL', latency: 24, uptime: 99.98, lastChecked: '2026-09-05T09:15:00Z' },
  { service: 'Database', status: 'OPERATIONAL', latency: 8, uptime: 99.99, lastChecked: '2026-09-05T09:14:30Z' },
  { service: 'Detection Engine', status: 'OPERATIONAL', latency: 42, uptime: 99.97, lastChecked: '2026-09-05T09:14:15Z' },
  { service: 'ML Engine', status: 'DEGRADED', latency: 128, uptime: 99.85, lastChecked: '2026-09-05T09:13:45Z' },
  { service: 'Threat Intelligence', status: 'OPERATIONAL', latency: 56, uptime: 99.96, lastChecked: '2026-09-05T09:14:00Z' },
  { service: 'Queue', status: 'OPERATIONAL', latency: 12, uptime: 99.99, lastChecked: '2026-09-05T09:14:45Z' },
];

const mockRecentActivity: RecentActivity[] = [
  { id: 'ACT-001', timestamp: '2026-09-05T09:12:00Z', actor: 'admin@demo.local', action: 'LOGIN', resource: 'Admin Console' },
  { id: 'ACT-002', timestamp: '2026-09-05T09:10:30Z', actor: 'analyst.jones@demo.local', action: 'USER_UPDATED', resource: 'Security Settings' },
  { id: 'ACT-003', timestamp: '2026-09-05T09:05:15Z', actor: 'system', action: 'SCAN_COMPLETED', resource: 'Email Scan THR-2026-423' },
  { id: 'ACT-004', timestamp: '2026-09-05T08:58:42Z', actor: 'admin@demo.local', action: 'THREAT_REVIEWED', resource: 'Threat Intelligence' },
  { id: 'ACT-005', timestamp: '2026-09-05T08:45:00Z', actor: 'system', action: 'SYSTEM_HEALTH_CHECK', resource: 'ML Engine' },
];

const mockRecentThreats: ThreatData[] = [
  { id: 'THR-2026-423', type: 'Credential Theft', severity: 'Critical', target: 'finance@acme.com', timestamp: '2026-09-05T09:20:00Z' },
  { id: 'THR-2026-422', type: 'Phishing', severity: 'High', target: 'support@example.org', timestamp: '2026-09-05T09:15:30Z' },
  { id: 'THR-2026-421', type: 'Malware', severity: 'Medium', target: 'hr@company.net', timestamp: '2026-09-05T09:10:15Z' },
  { id: 'THR-2026-420', type: 'BEC', severity: 'Critical', target: 'ceo@enterprise.com', timestamp: '2026-09-05T09:05:00Z' },
  { id: 'THR-2026-419', type: 'Suspicious Activity', severity: 'Low', target: 'dev@startup.io', timestamp: '2026-09-05T09:00:45Z' },
];

const scanActivityData = [
  { hour: '00:00', scans: 1200, threats: 45 },
  { hour: '04:00', scans: 850, threats: 32 },
  { hour: '08:00', scans: 3200, threats: 128 },
  { hour: '12:00', scans: 4800, threats: 210 },
  { hour: '16:00', scans: 3800, threats: 165 },
  { hour: '20:00', scans: 2400, threats: 92 },
];

const threatSeverityData = [
  { name: 'Critical', value: 342, color: '#F87171' },
  { name: 'High', value: 984, color: '#FBBF24' },
  { name: 'Medium', value: 2560, color: '#60A5FA' },
  { name: 'Low', value: 8617, color: '#34D399' },
];

const detectionRateData = [
  { day: 'Mon', rate: 98.2 },
  { day: 'Tue', rate: 98.5 },
  { day: 'Wed', rate: 98.9 },
  { day: 'Thu', rate: 99.1 },
  { day: 'Fri', rate: 98.7 },
  { day: 'Sat', rate: 98.4 },
  { day: 'Sun', rate: 98.0 },
];

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'DEGRADED': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'OFFLINE': return 'bg-red-900/30 text-red-300 border-red-700';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Administrator Console</h1>
          <p className="text-sm text-gray-400">Real-time overview of platform health, threats, and security operations</p>
        </div>
        <div className="text-xs text-cyan-400 font-mono flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          LIVE • LAST UPDATED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            <p className="text-3xl font-bold text-white">{mockMetrics.totalUsers.toLocaleString()}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400 flex items-center gap-1">
                <TrendingUp size={12} />
                {mockMetrics.activeUsers.toLocaleString()} active
              </span>
              <span className="text-gray-500">72% engagement</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Mail className="text-green-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">EMAIL SCANS</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{(mockMetrics.emailsScanned / 1000000).toFixed(1)}M</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400">+12.8% this week</span>
              <span className="text-gray-500">48.2M total</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Shield className="text-red-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">THREATS DETECTED</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{mockMetrics.threatsDetected.toLocaleString()}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {mockMetrics.criticalThreats} critical
              </span>
              <span className="text-gray-500">+2.4% vs last week</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Cpu className="text-yellow-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">DETECTION RATE</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{mockMetrics.detectionRate}%</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400 flex items-center gap-1">
                <TrendingUp size={12} />
                +0.3% improvement
              </span>
              <span className="text-gray-500">AI-powered</span>
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
            Scan Activity (Last 24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scanActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151D28" vertical={false} />
                <XAxis dataKey="hour" stroke="#4A5568" fontSize={11} />
                <YAxis stroke="#4A5568" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080D14',
                    borderColor: '#151D28',
                    fontSize: '12px',
                    color: '#CBD5E0'
                  }}
                  labelStyle={{ color: '#CBD5E0', fontWeight: 'bold' }}
                />
                <Legend />
                <Bar dataKey="scans" name="Scans" fill="#4299E1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="threats" name="Threats" fill="#F56565" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Severity Distribution */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} />
            Threat Severity Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatSeverityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080D14',
                    borderColor: '#151D28',
                    fontSize: '12px',
                    color: '#CBD5E0'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {threatSeverityData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-xs text-gray-500">{item.name}</div>
                <div className="text-lg font-bold text-white">{item.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Server size={16} />
            System Health Status
          </h2>
          <div className="space-y-3">
            {mockSystemStatus.map((service) => (
              <div key={service.service} className="flex items-center justify-between p-3 bg-[#0B111A] rounded border border-[#151D28]">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${service.status === 'OPERATIONAL' ? 'bg-green-400' : service.status === 'DEGRADED' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-bold text-white">{service.service}</p>
                    <p className="text-xs text-gray-400">Latency: {service.latency}ms • Uptime: {service.uptime}%</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded border ${getStatusBadge(service.status)}`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#151D28] flex justify-between text-xs text-gray-400">
            <span>Last system check: {mockSystemStatus[0] ? new Date(mockSystemStatus[0].lastChecked).toLocaleTimeString() : 'N/A'}</span>
            <button
              onClick={() => addToast('System status refreshed (DEMO)', 'info')}
              className="text-cyan-400 hover:text-cyan-300 font-bold"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {/* Detection Rate Chart */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp size={16} />
            Detection Rate (7-Day)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detectionRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151D28" vertical={false} />
                <XAxis dataKey="day" stroke="#4A5568" fontSize={11} />
                <YAxis stroke="#4A5568" fontSize={11} domain={[97, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080D14',
                    borderColor: '#151D28',
                    fontSize: '12px',
                    color: '#CBD5E0'
                  }}
                  formatter={(value) => [`${value}%`, 'Detection Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#34D399"
                  strokeWidth={3}
                  dot={{ fill: '#34D399' }}
                  activeDot={{ r: 6, fill: '#34D399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Administrative Activity */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Clock size={16} />
            Recent Administrative Activity
          </h2>
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-[#0B111A] rounded border border-[#151D28]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{activity.action}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-cyan-400 font-mono">{activity.id}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activity.actor} • {activity.resource}
                  </p>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Threats */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Eye size={16} />
            Recent High-Priority Threats
          </h2>
          <div className="space-y-3">
            {mockRecentThreats.map((threat) => (
              <div key={threat.id} className="p-3 bg-[#0B111A] rounded border border-[#151D28]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{threat.id}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getSeverityBadge(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(threat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{threat.type}</p>
                <p className="text-xs text-gray-400 truncate">Target: {threat.target}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
