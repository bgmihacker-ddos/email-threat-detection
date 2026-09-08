import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Download, Info, ArrowLeft, ShieldAlert
} from 'lucide-react';
import { downloadReport, getAnalysisById } from '../services/analysisApi';
import { categorizeIoc } from '../utils/iocCategorization';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Panel } from '../components/common/Panel';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';

type AnyRecord = Record<string, any>;

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    reasoning: true, authentication: true, attackChain: true,
    findings: true, iocs: true, raw: false
  });

  useEffect(() => {
    if (!id) return;
    getAnalysisById(id)
      .then(setAnalysis)
      .catch((e) => setError(e.message || 'Failed to load analysis. Ensure backend is running.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !analysis) return <div className="mx-auto max-w-5xl rounded border border-red-800/60 bg-red-950/30 p-5 text-sm text-red-300 font-mono">{error || 'Analysis not found.'}</div>;

  const authentication = analysis.authentication || {};
  const findings = Array.isArray(analysis.forensic_findings) ? analysis.forensic_findings : [];
  const iocs = extractedIocs(analysis);
  const attackChain = Array.isArray(analysis.attack_chain_steps) ? analysis.attack_chain_steps : [];
  const verdict = String(analysis.verdict || 'unknown');
  const risk = Number(analysis.risk_score || 0);

  return (
    <div className="mx-auto max-w-[1550px] space-y-6 pb-12 font-sans text-gray-200">
      <SecurityEnvironmentBackground profile="investigation" threatLevel={risk > 70 ? 'high' : risk > 40 ? 'medium' : 'safe'} />

      <header className="relative z-10 flex flex-col gap-4 border-b border-[#151D28] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/history" className="mb-3 inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-cyan-300 font-mono uppercase tracking-widest">
            <ArrowLeft size={13} /> Return to Investigation History
          </Link>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-500 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30 font-mono">
               FORENSIC ANALYSIS REPORT
             </span>
             <span className="text-[10px] font-mono text-gray-600 tracking-widest">ID: {analysis.analysis_id}</span>
          </div>
          <h1 className="mt-2 font-mono text-xl font-semibold text-white truncate max-w-3xl">{analysis.subject || 'Untitled investigation'}</h1>
          <p className="mt-1.5 text-xs text-gray-400 font-mono">
            {analysis.sender || 'Sender identity unavailable'} · {formatDate(analysis.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => id && downloadReport(id, 'json')} className="btn-secondary">
            <Download size={13} /> JSON Export
          </button>
          <button onClick={() => id && downloadReport(id, 'html')} className="btn-secondary">
            <Download size={13} /> Printable Report
          </button>
        </div>
      </header>

      {/* Main Verdict Panel */}
      <section className={`relative z-10 overflow-hidden rounded-lg border p-6 flex flex-col md:flex-row gap-8 ${verdictToneBorder(verdict)}`}>
        <div className="absolute inset-y-0 left-0 w-1 bg-current opacity-80" />
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 font-mono mb-2">Executive Verdict</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className={`text-3xl font-bold uppercase tracking-tight font-mono ${verdictTone(verdict)}`}>{verdict}</span>
            <SeverityBadge severity={analysis.severity || verdict} />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 font-mono">{analysis.summary || 'No executive summary provided.'}</p>
        </div>
        <RiskGauge score={risk} />
        <div className="flex flex-col gap-4 border-l border-[#1C2A3D] pl-6 min-w-[200px]">
           <ScoreStat label="Data Integrity" value={analysis.confidence !== undefined ? `${analysis.confidence}%` : 'Unavailable'} help="Forensic metadata completeness" />
           <ScoreStat label="Analysis Status" value={analysis.status || 'Completed'} />
        </div>
      </section>

      {/* Primary Workspaces Grid */}
      <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel title="AUTHENTICATION & IDENTITY" open={expanded.authentication} onToggle={() => setExpanded(e => ({...e, authentication: !e.authentication}))} className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {(['spf', 'dkim', 'dmarc', 'arc'] as const).map(name => {
              const item = authentication[name] || {};
              return <div key={name} className="rounded border border-[#1C2A3D] bg-[#060A10] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">{name}</p>
                <p className={`mt-2 text-sm font-bold uppercase font-mono ${authTone(item.status)}`}>{item.status || 'Missing'}</p>
              </div>;
            })}
          </div>
        </Panel>
        <Panel title="THREAT REASONING" open={expanded.reasoning} onToggle={() => setExpanded(e => ({...e, reasoning: !e.reasoning}))} className="lg:col-span-3">
          <p className="text-xs leading-relaxed text-gray-300 font-mono mb-6">{analysis.extended_reasoning?.summary || analysis.summary}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <EvidenceColumn title="Critical Indicators" tone="text-red-400" items={(analysis.risk_breakdown || []).filter((item: any) => item.points > 5).map((item: any) => `${item.reason}`)} />
            <EvidenceColumn title="Contextual Clues" tone="text-amber-400" items={(analysis.risk_breakdown || []).filter((item: any) => item.points <= 5).map((item: any) => item.reason)} />
            <EvidenceColumn title="Positive Alignments" tone="text-emerald-400" items={(['spf', 'dkim', 'dmarc'] as const).filter(proto => authentication[proto]?.status === 'pass').map(proto => `${proto.toUpperCase()} Verified`)} />
          </div>
        </Panel>
      </div>

      {/* Forensic Pipeline Visualizations */}
      {attackChain.length > 0 && (
         <Panel title={`ATTACK CHAIN · ${attackChain.length} STAGES IDENTIFIED`} open={expanded.attackChain} onToggle={() => setExpanded(e => ({...e, attackChain: !e.attackChain}))}>
           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {attackChain.map((step: AnyRecord, index: number) => (
              <div key={index} className="rounded border border-[#1C2A3D] bg-[#060A10] p-4 text-xs font-mono">
                <div className="flex items-center gap-2 mb-3">
                   <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-950/30 text-[10px] text-cyan-300">{index + 1}</div>
                   <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">STAGE {index + 1}</span>
                </div>
                <p className="text-gray-200 font-semibold mb-2">{step.title || step.stage}</p>
                <div className="text-[11px] text-gray-500 leading-relaxed">{step.description}</div>
              </div>
            ))}
           </div>
         </Panel>
      )}

      {/* Findings & IOCs */}
      <div className="relative z-10 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title={`FORENSIC FINDINGS · ${findings.length}`} open={expanded.findings} onToggle={() => setExpanded(e => ({...e, findings: !e.findings}))}>
          <FindingList findings={findings} />
        </Panel>
        <Panel title={`EXTRACTED INDICATORS (IOCs) · ${iocs.length}`} open={expanded.iocs} onToggle={() => setExpanded(e => ({...e, iocs: !e.iocs}))}>
          <IocList iocs={iocs} />
        </Panel>
      </div>

      {/* Raw Sources & Intel */}
      {(analysis.raw_email || analysis.raw_content) && (
        <Panel title="RAW EMAIL MIME SOURCE" open={expanded.raw} onToggle={() => setExpanded(e => ({...e, raw: !e.raw}))}>
           <pre className="max-h-[300px] overflow-auto rounded border border-[#1C2A3D] bg-[#05080D] p-4 font-mono text-[11px] leading-relaxed text-gray-500">{analysis.raw_email || analysis.raw_content}</pre>
        </Panel>
      )}
    </div>
  );
}

// Subcomponents as previously defined...
function LoadingState() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="h-24 animate-pulse rounded border border-[#151D28] bg-[#080D14]" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-28 animate-pulse rounded border border-[#151D28] bg-[#080D14]" />
        <div className="col-span-2 h-28 animate-pulse rounded border border-[#151D28] bg-[#080D14]" />
      </div>
      <p className="font-mono text-xs text-cyan-400 animate-pulse">LOADING FORENSIC ANALYSIS...</p>
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  const tone = score >= 75 ? 'text-red-400' : score >= 40 ? 'text-yellow-400' : 'text-emerald-400';
  return (
    <div className="flex flex-col justify-center pl-6 border-l border-[#1C2A3D]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">Risk score</p>
      <p className={`mt-1 font-mono text-4xl font-bold ${tone}`}>{Math.round(score)}<span className="text-base text-gray-600">/100</span></p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#151D28]"><div className={`h-full rounded-full ${score >= 75 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} /></div>
    </div>
  );
}

function ScoreStat({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <div className="border-l border-[#1C2A3D] pl-6 flex flex-col justify-center">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">{label}{help && <span title={help}><Info size={11} /></span>}</p>
      <p className="mt-1 text-sm font-semibold text-gray-200 font-mono">{value}</p>
    </div>
  );
}

function EvidenceColumn({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return <div><p className={`text-[10px] font-bold uppercase tracking-wider font-mono ${tone}`}>{title}</p><ul className="mt-2 space-y-1.5 text-xs text-gray-400 font-mono">{items.length ? items.map((item, index) => <li key={index} className="flex gap-2"><span>•</span>{item}</li>) : <li className="text-gray-600 italic">None detected.</li>}</ul></div>;
}

function FindingList({ findings }: { findings: AnyRecord[] }) {
  if (!findings.length) return <Empty text="No deterministic findings were returned." />;
  return <div className="space-y-2">{findings.map((finding, index) => <div key={index} className="rounded border border-[#1C2A3D] bg-[#060A10] p-3 font-mono"><div className="flex items-start justify-between gap-3 mb-2"><div className="flex gap-2"><ShieldAlert size={15} className="mt-0.5 shrink-0 text-red-400" /><span className="text-xs font-medium text-gray-200">{finding.title}</span></div><SeverityBadge severity={finding.severity || 'info'} /></div><p className="text-[11px] leading-relaxed text-gray-500">{finding.description}</p></div>)}</div>;
}

function IocList({ iocs }: { iocs: AnyRecord[] }) {
  if (!iocs.length) return <Empty text="No extracted indicators were returned." />;
  return <div className="space-y-4">{(['Actual IOC', 'Infrastructure', 'Forensic Artifact'] as const).map(category => { const categoryIocs = iocs.filter(ioc => categorizeIoc(ioc) === category); if (!categoryIocs.length) return null; return <div key={category}><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono mb-2"><span className={`h-1.5 w-1.5 rounded-full ${category === 'Actual IOC' ? 'bg-red-400' : category === 'Infrastructure' ? 'bg-yellow-400' : 'bg-cyan-400'}`} />{category}</p><div className="space-y-1">{categoryIocs.map((ioc, index) => <div key={index} className="flex items-center justify-between gap-3 rounded bg-[#060A10] px-2.5 py-1.5 font-mono text-[11px] text-gray-300"><span className="truncate" title={ioc.value}>{ioc.normalized_value || ioc.value}</span><span className="shrink-0 rounded bg-[#151D28] px-1.5 py-0.5 text-[9px] text-gray-500 uppercase">{ioc.type}</span></div>)}</div></div>; })}</div>;
}

function Empty({ text }: { text: string }) { return <p className="rounded border border-dashed border-[#1C2A3D] p-5 text-center font-mono text-[11px] text-gray-600">{text}</p>; }
function extractedIocs(analysis: AnyRecord) { if (analysis.extracted_iocs?.iocs) return analysis.extracted_iocs.iocs; if (Array.isArray(analysis.iocs)) return analysis.iocs; return []; }
function formatDate(value?: string) { if (!value) return 'N/A'; const date = new Date(value); return date.toLocaleString(); }
function verdictTone(v: string) { return ['malicious', 'critical'].includes(v.toLowerCase()) ? 'text-red-400' : ['suspicious'].includes(v.toLowerCase()) ? 'text-yellow-400' : 'text-emerald-400'; }
function verdictToneBorder(v: string) { return ['malicious', 'critical'].includes(v.toLowerCase()) ? 'border-red-500/30 bg-red-950/20' : ['suspicious'].includes(v.toLowerCase()) ? 'border-yellow-500/30 bg-yellow-950/20' : 'border-emerald-500/25 bg-emerald-950/20'; }
function authTone(s?: string) { return s === 'pass' ? 'text-emerald-400' : s === 'fail' ? 'text-red-400' : 'text-gray-500'; }
