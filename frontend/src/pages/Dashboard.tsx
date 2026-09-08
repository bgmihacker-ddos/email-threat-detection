import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, MailSearch } from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { MetricCard } from '../components/common/MetricCard';
import { DashboardSummary, getDashboardSummary } from '../services/analysisApi';

const EMPTY_SUMMARY: DashboardSummary = {
  metrics: { total_analyses: 0, flagged_analyses: 0, malicious_analyses: 0, average_risk_score: 0 },
  verdict_counts: {}, severity_counts: {}, activity: [], distribution: [], top_indicators: [], recent_analyses: [], data_source: 'persisted_local_analyses',
};

const tooltipStyle = { backgroundColor: '#0B111A', border: '1px solid #1C2A3D', borderRadius: '6px', color: '#E5E7EB', fontSize: '11px' };

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => setError('Dashboard metrics are unavailable.')).finally(() => setLoading(false));
  }, []);

  const metrics = [
    ['Analyses processed', summary.metrics.total_analyses, 'text-cyan-400'],
    ['Investigations flagged', summary.metrics.flagged_analyses, 'text-yellow-400'],
    ['Malicious verdicts', summary.metrics.malicious_analyses, 'text-red-400'],
    ['Average risk score', summary.metrics.average_risk_score, 'text-orange-400'],
  ] as const;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#151D28] pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-500">Security operations center</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Email security overview</h1>
          <p className="mt-1 text-sm text-gray-500">Real-time view of persisted email investigations and extracted intelligence.</p>
        </div>
        <Link to="/analyze" className="inline-flex items-center justify-center gap-2 rounded bg-cyan-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
          <MailSearch size={15} /> Analyze email <ArrowRight size={14} />
        </Link>
      </header>

      {error && <div className="rounded border border-yellow-800/70 bg-yellow-950/30 px-4 py-3 text-xs text-yellow-200">{error}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, tone]) => <MetricCard key={label} title={label} value={loading ? '—' : value} tone={tone} />)}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5 rounded border border-[#151D28] bg-[#080D14] p-5">
          <SectionTitle eyebrow="Investigation volume" title="Threat activity" />
          {summary.activity.length ? <ResponsiveContainer width="100%" height={225}><BarChart data={summary.activity} barGap={3}><XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#151D28' }} /><Bar dataKey="analyses" name="Analyses" fill="#0891B2" radius={[3, 3, 0, 0]} /><Bar dataKey="flagged" name="Flagged" fill="#F59E0B" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState text="No persisted analysis activity is available yet." />}
        </div>
        <div className="xl:col-span-3 rounded border border-[#151D28] bg-[#080D14] p-5">
          <SectionTitle eyebrow="Risk posture" title="Severity distribution" />
          {summary.distribution.length ? <div className="relative"><ResponsiveContainer width="100%" height={225}><PieChart><Pie data={summary.distribution} innerRadius={56} outerRadius={81} paddingAngle={3} dataKey="value">{summary.distribution.map(entry => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-[10px] uppercase tracking-wider text-gray-500">Verdicts</span><span className="text-lg font-bold text-white">{summary.metrics.total_analyses}</span></div></div> : <EmptyState text="No severity distribution is available yet." />}
        </div>
        <div className="xl:col-span-4 rounded border border-[#151D28] bg-[#080D14] p-5">
          <SectionTitle eyebrow="Extracted intelligence" title="Most observed indicators" />
          {summary.top_indicators.length ? <div className="space-y-1">{summary.top_indicators.map((item, index) => <div key={item.indicator} className="flex items-center gap-3 rounded px-2 py-2.5 transition-colors hover:bg-[#0D1520]"><span className="w-5 text-center font-mono text-[10px] text-gray-600">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1 truncate font-mono text-xs text-gray-300">{item.indicator}</span><span className="rounded bg-[#151D28] px-2 py-0.5 font-mono text-[10px] text-cyan-300">{item.count}</span></div>)}</div> : <EmptyState text="No indicators have been extracted yet." />}
        </div>
      </section>

      <section className="overflow-hidden rounded border border-[#151D28] bg-[#080D14]">
        <div className="flex items-center justify-between border-b border-[#151D28] px-5 py-4"><SectionTitle eyebrow="Latest queue" title="Recent investigations" compact /><Link className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300" to="/history">View history <ArrowRight size={13} /></Link></div>
        {summary.recent_analyses.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#060A10] text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-3 font-semibold">Investigation</th><th className="px-4 py-3 font-semibold">Sender</th><th className="px-4 py-3 font-semibold">Observed</th><th className="px-4 py-3 font-semibold">Risk</th><th className="px-5 py-3 font-semibold">Severity</th></tr></thead><tbody>{summary.recent_analyses.map(item => <tr key={item.analysis_id} className="border-t border-[#151D28]/70 transition-colors hover:bg-[#0D1520]"><td className="px-5 py-3"><Link to={`/analysis/${item.analysis_id}`} className="block max-w-[360px] truncate font-medium text-gray-200 hover:text-cyan-300">{item.subject || 'Untitled email'}</Link><span className="font-mono text-[10px] text-gray-600">{item.analysis_id}</span></td><td className="max-w-[200px] truncate px-4 py-3 text-gray-400">{item.sender || 'Unavailable'}</td><td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(item.created_at)}</td><td className="px-4 py-3"><span className={item.risk_score >= 75 ? 'font-mono text-red-400' : item.risk_score >= 40 ? 'font-mono text-yellow-400' : 'font-mono text-emerald-400'}>{item.risk_score}/100</span></td><td className="px-5 py-3"><SeverityBadge severity={item.severity} /></td></tr>)}</tbody></table></div> : <div className="p-10"><EmptyState text="No analyses have been persisted. Start an email investigation to populate this workspace." /></div>}
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) { return <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">{eyebrow}</p><h2 className={`${compact ? 'mt-0.5 text-sm' : 'mt-1 text-base'} font-semibold text-gray-200`}>{title}</h2></div>; }
function EmptyState({ text }: { text: string }) { return <div className="flex h-[200px] items-center justify-center px-6 text-center font-mono text-xs text-gray-500">{text}</div>; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString(); }
