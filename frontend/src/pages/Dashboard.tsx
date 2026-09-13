import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowRight, MailSearch, Shield, Activity, Database, Clock, ChevronRight, Terminal } from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { MetricCard } from '../components/common/MetricCard';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';
import { DashboardSummary, DashboardTrends, getDashboardSummary, getDashboardTrends } from '../services/analysisApi';
import { useWebSocketAlerts } from '../hooks/useWebSocket';

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

const tooltipStyle = {
  backgroundColor: '#101b21',
  border: '1px solid #29454b',
  borderRadius: '6px',
  color: '#F3F4F6',
  fontSize: '11px',
  fontFamily: 'monospace'
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const { alerts, connected } = useWebSocketAlerts();

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError('Forensic dashboard metrics are currently unavailable.'))
      .finally(() => setLoading(false));
    getDashboardTrends().then(setTrends).catch(() => setTrends(null));
  }, []);

  const totalIOCs = summary.top_indicators.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="dashboard-shell relative mx-auto max-w-[1680px] space-y-5">
      <SecurityEnvironmentBackground profile="dashboard" intensity="subtle" />
      {/* Top Banner / Hero Header */}
      <header className="dashboard-hero relative z-10 flex flex-col gap-5 overflow-hidden border-b border-[#29454b] p-2 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#58d6c0]/[0.07] to-transparent" />
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#58d6c0] shadow-[0_0_12px_rgba(88,214,192,0.8)] animate-pulse" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#58d6c0]">Security operations · email forensics</p>
          </div>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
            Investigation overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9aadaa]">
            A measured view of recent email investigations, risk posture, and infrastructure evidence.
          </p>
        </div>

        <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="hidden border-l border-[#29454b] pl-4 sm:block"><p className="font-mono text-[9px] uppercase tracking-wider text-[#718581]">Operating posture</p><p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Evidence collection active</p></div>
          <Link
            to="/analyze"
            className="btn-primary shadow-lg shadow-[#2eaa9d]/20"
          >
            <MailSearch size={15} />
            <span>Analyze EML / MIME</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Telemetry Strip */}
      <div className="dashboard-telemetry relative z-10 grid grid-cols-2 gap-3 border-y border-[#1b3037] py-3 text-xs font-mono md:grid-cols-4">
        <div className="flex items-center gap-2.5 px-2">
          <Database size={14} className="shrink-0 text-[#58d6c0]" />
          <div className="min-w-0">
            <p className="text-[9px] text-gray-500 uppercase">Data Repository</p>
            <p className="text-xs text-gray-200 font-semibold truncate">{summary.data_source || 'Local SQLite Store'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-l border-[#1b3037] px-2">
          <Shield size={14} className="shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <p className="text-[9px] text-gray-500 uppercase">Forensic Engine</p>
            <p className="text-xs text-gray-200 font-semibold">Deterministic V1.5</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-l border-[#1b3037] px-2">
          <Activity size={14} className="shrink-0 text-[#f0b35a]" />
          <div className="min-w-0">
            <p className="text-[9px] text-gray-500 uppercase">Total IOCs Extracted</p>
            <p className="text-xs text-gray-200 font-semibold">{loading ? '—' : totalIOCs}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-l border-[#1b3037] px-2">
          <Clock size={14} className="shrink-0 text-[#b1a8df]" />
          <div className="min-w-0">
            <p className="text-[9px] text-gray-500 uppercase">Pipeline Mode</p>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Real-time Ingestion
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 rounded border border-yellow-800/70 bg-[#302519]/70 px-4 py-3 font-mono text-xs text-yellow-200">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <section className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Investigations"
          value={loading ? '—' : summary.metrics.total_analyses}
          tone="text-cyan-400"
        />
        <MetricCard
          title="Flagged Investigations"
          value={loading ? '—' : summary.metrics.flagged_analyses}
          tone="text-yellow-400"
        />
        <MetricCard
          title="Malicious Verdicts"
          value={loading ? '—' : summary.metrics.malicious_analyses}
          tone="text-red-400"
        />
        <MetricCard
          title="Average Risk Score"
          value={loading ? '—' : `${summary.metrics.average_risk_score}/100`}
          tone={summary.metrics.average_risk_score >= 60 ? 'text-red-400' : 'text-orange-400'}
        />
      </section>

      {/* Analytical Charts & Threat Indicators */}
      <section className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Activity Volume Chart */}
        <div className="dashboard-panel xl:col-span-6 rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5 shadow-[0_18px_45px_rgba(2,12,15,0.2)]">
          <SectionTitle eyebrow="INVESTIGATION CHRONOLOGY" title="Threat Activity Volume" />
          <div className="mt-4">
            {summary.activity.length ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={summary.activity} barGap={4}>
                  <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1b3037' }} />
                  <Bar dataKey="analyses" name="Total Ingested" fill="#0891B2" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="flagged" name="High Risk Flagged" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No persisted activity timeline available yet." />
            )}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="dashboard-panel xl:col-span-3 rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5 shadow-[0_18px_45px_rgba(2,12,15,0.2)]">
          <SectionTitle eyebrow="RISK POSTURE" title="Severity Distribution" />
          <div className="mt-4">
            {summary.distribution.length ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={summary.distribution} innerRadius={58} outerRadius={84} paddingAngle={4} dataKey="value">
                      {summary.distribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Investigations</span>
                  <span className="text-xl font-bold font-mono text-white">{summary.metrics.total_analyses}</span>
                </div>
              </div>
            ) : (
              <EmptyState text="No distribution data available." />
            )}
          </div>
        </div>

        {/* Top Indicators */}
        <div className="dashboard-panel xl:col-span-3 rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5 shadow-[0_18px_45px_rgba(2,12,15,0.2)]">
          <SectionTitle eyebrow="FORENSIC ARTIFACTS" title="Observed Intelligence Indicators" />
          <div className="mt-4">
            {summary.top_indicators.length ? (
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {summary.top_indicators.map((item, index) => (
                  <div key={item.indicator} className="flex items-center justify-between gap-3 rounded bg-[#081216] border border-[#1b3037]/60 px-3 py-2 transition-colors hover:border-cyan-500/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[10px] text-gray-600 w-4">{String(index + 1).padStart(2, '0')}</span>
                      <span className="font-mono text-xs text-gray-300 truncate" title={item.indicator}>
                        {item.indicator}
                      </span>
                    </div>
                    <span className="rounded bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 font-mono text-[10px] text-cyan-300 shrink-0">
                      {item.count} hit{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No indicators extracted yet. Run an analysis to populate." />
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="dashboard-panel rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5"><SectionTitle eyebrow="ORIGIN ANALYSIS" title="Top countries" /><ResponsiveContainer width="100%" height={180}><BarChart data={trends?.countries || []} layout="vertical"><XAxis type="number" allowDecimals={false} hide /><YAxis type="category" dataKey="name" width={82} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#22d3ee" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="dashboard-panel rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5"><SectionTitle eyebrow="TRUST ANALYSIS" title="Authentication results" /><div className="mt-4 space-y-3">{['spf', 'dkim', 'dmarc'].map((name) => <div key={name} className="flex items-center justify-between border-b border-[#1b3037] pb-2 text-xs"><span className="font-mono uppercase text-gray-400">{name}</span><span className="font-mono text-gray-300">{Object.entries(trends?.auth_results?.[name] || {}).map(([status, count]) => `${status}: ${count}`).join(' · ') || 'no observations'}</span></div>)}</div></div>
        <div className="dashboard-panel rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5"><SectionTitle eyebrow="ATTACK TAXONOMY" title="Observed attack types" /><div className="mt-4 space-y-2">{(trends?.attack_types || []).slice(0, 6).map((item) => <div key={item.name} className="flex items-center justify-between rounded bg-[#081216] px-3 py-2 text-xs"><span className="truncate text-gray-300">{item.name}</span><span className="font-mono text-cyan-300">{item.count}</span></div>)}{!trends?.attack_types?.length && <EmptyState text="No attack types observed yet." />}</div></div>
      </section>

      <section className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="dashboard-panel xl:col-span-8 rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5"><SectionTitle eyebrow="TREND TELEMETRY" title="Thirty-day investigation trend" /><div className="mt-4"><ResponsiveContainer width="100%" height={220}><LineChart data={trends?.daily || []}><XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="analyses" stroke="#22d3ee" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="flagged" stroke="#f59e0b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></div>
        <div className="dashboard-panel xl:col-span-4 rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5"><SectionTitle eyebrow="LIVE ALERTS" title={connected ? 'WebSocket connected' : 'WebSocket unavailable'} /><div className="mt-4 space-y-2">{alerts.length ? alerts.map((alert, index) => <div key={`${alert.analysis_id}-${index}`} className="rounded border border-red-900/50 bg-red-950/20 p-3 text-xs"><p className="font-mono text-red-300">{alert.verdict || 'alert'} · {alert.risk_score ?? '—'}/100</p><p className="mt-1 text-gray-300">{alert.summary || alert.analysis_id}</p></div>) : <EmptyState text="No live alerts received in this session." />}</div></div>
      </section>

      {/* Recent Investigation Queue Table */}
      <section className="relative z-10 overflow-hidden rounded-lg border border-[#1b3037] bg-[#101b21]/90 shadow-[0_18px_45px_rgba(2,12,15,0.2)]">
        <div className="flex items-center justify-between border-b border-[#1b3037] bg-[#0c171c] px-5 py-4">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-cyan-400" />
            <SectionTitle eyebrow="CASE LOG" title="Recent Email Investigations" compact />
          </div>
          <Link className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors" to="/history">
            Complete History <ArrowRight size={13} />
          </Link>
        </div>

        {summary.recent_analyses.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-[#081216] text-[10px] uppercase font-mono tracking-wider text-gray-500 border-b border-[#1b3037]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Subject / Case ID</th>
                  <th className="px-4 py-3 font-semibold">Sender Identity</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Risk Score</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3037]/60">
                {summary.recent_analyses.map((item) => (
                  <tr key={item.analysis_id} className="transition-colors hover:bg-[#0D1520]/80">
                    <td className="px-5 py-3.5">
                      <Link to={`/analysis/${item.analysis_id}`} className="block max-w-[340px] truncate font-medium text-gray-200 hover:text-cyan-300">
                        {item.subject || 'Untitled Subject'}
                      </Link>
                      <span className="font-mono text-[10px] text-gray-600">{item.analysis_id}</span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3.5 text-gray-400 font-mono text-[11px]">
                      {item.sender || 'Unknown Sender'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-500 font-mono text-[11px]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.risk_score >= 70
                          ? 'bg-red-950/50 text-red-400 border border-red-800/50'
                          : item.risk_score >= 40
                          ? 'bg-amber-950/50 text-amber-400 border border-amber-800/50'
                          : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {item.risk_score} / 100
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/analysis/${item.analysis_id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Inspect <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10">
            <EmptyState text="No investigations found in database. Ingest an EML file to initialize SOC feed." />
          </div>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-cyan-500/80">{eyebrow}</p>
      <h2 className={`${compact ? 'mt-0.5 text-sm' : 'mt-1 text-base'} font-semibold text-gray-100`}>{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-[180px] items-center justify-center px-6 text-center font-mono text-xs text-gray-500">
      {text}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString();
}
