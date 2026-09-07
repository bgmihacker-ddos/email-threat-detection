import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Download, ChevronDown, ChevronRight } from 'lucide-react';
import { downloadReport, getAnalysisById } from '../services/analysisApi';

type AnyRecord = Record<string, any>;

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    getAnalysisById(id)
      .then(setAnalysis)
      .catch(() => setError('Failed to load analysis.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-white">Loading analysis...</div>;
  if (error || !analysis) return <div className="p-6 text-red-400">{error || 'Analysis not found.'}</div>;

  const authentication = analysis.authentication || {};
  const findings = analysis.forensic_findings || [];
  const iocs = analysis.extracted_iocs?.iocs || [];
  const toggle = (key: string) => setExpanded((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between gap-3 border-b border-[#151D28] pb-4">
        <div>
          <p className="text-[10px] text-cyan-500 font-bold tracking-widest">FORENSIC ANALYSIS</p>
          <h1 className="text-xl font-bold break-all">{analysis.analysis_id}</h1>
          <p className="text-xs text-gray-400 mt-1">{analysis.summary}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => id && downloadReport(id, 'json')} className="px-3 py-2 text-xs border border-[#263449] rounded hover:border-cyan-500 flex items-center gap-2"><Download size={13} /> JSON</button>
          <button onClick={() => id && downloadReport(id, 'html')} className="px-3 py-2 text-xs border border-[#263449] rounded hover:border-cyan-500 flex items-center gap-2"><Download size={13} /> PRINTABLE HTML</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric title="RISK SCORE" value={`${analysis.risk_score} / 100`} tone={riskTone(analysis.risk_score)} />
        <Metric title="VERDICT" value={String(analysis.verdict).toUpperCase()} tone={verdictTone(analysis.verdict)} />
        <Metric title="SEVERITY" value={String(analysis.severity).toUpperCase()} tone={severityTone(analysis.severity)} />
        <Metric title="CONFIDENCE" value={`${analysis.confidence}%`} tone="text-cyan-400" />
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['spf', 'dkim', 'dmarc', 'arc'] as const).map((name) => {
          const item = authentication[name] || {};
          return <Metric key={name} title={name} value={String(item.status || 'missing').toUpperCase()} tone={item.status === 'pass' ? 'text-green-400' : item.status === 'fail' ? 'text-red-400' : 'text-gray-400'} />;
        })}
      </section>

      <Panel title="THREAT REASONING" open={expanded.reasoning ?? true} onToggle={() => toggle('reasoning')}>
        <p className="text-sm text-gray-300 mb-3">{analysis.extended_reasoning?.summary || analysis.summary}</p>
        <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
          {(analysis.extended_reasoning?.decision_path || analysis.threat_reasoning || analysis.reasons || []).map((reason: any, index: number) => <li key={index}>{typeof reason === 'string' ? reason : reason.reason || reason.step || JSON.stringify(reason)}</li>)}
        </ul>
      </Panel>

      <Panel title={`ATTACK CHAIN (${(analysis.attack_chain_steps || []).length})`} open={expanded.chain ?? true} onToggle={() => toggle('chain')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(analysis.attack_chain_steps || []).map((step: AnyRecord, index: number) => <div key={`${step.stage}-${index}`} className="border border-[#1c2a3d] rounded p-3"><div className="text-xs font-bold text-cyan-400">{step.title || step.stage}</div><div className="text-[10px] text-gray-500 uppercase mt-1">{step.status || 'observed'}</div><ul className="mt-2 text-xs text-gray-400 list-disc pl-4">{(step.evidence || []).map((evidence: string, evidenceIndex: number) => <li key={evidenceIndex}>{evidence}</li>)}</ul></div>)}
        </div>
      </Panel>

      <Panel title={`FORENSIC FINDINGS (${findings.length})`} open={expanded.findings ?? true} onToggle={() => toggle('findings')}>
        <FindingList findings={findings} />
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={`EXTRACTED IOCs (${iocs.length})`} open={expanded.iocs ?? true} onToggle={() => toggle('iocs')}>
          {iocs.length ? <div className="space-y-2">{iocs.map((ioc: AnyRecord, index: number) => <div key={`${ioc.type}-${ioc.normalized_value || ioc.value}-${index}`} className="border-b border-[#151D28] pb-2"><span className="text-[10px] uppercase text-cyan-500 mr-2">{ioc.type}</span><span className="text-xs text-gray-300 break-all">{ioc.normalized_value || ioc.value}</span><div className="text-[10px] text-gray-500">{ioc.source || 'unknown source'} · confidence {ioc.confidence ?? 'n/a'}</div></div>)}</div> : <Empty text="No IOCs extracted." />}
        </Panel>
        <Panel title="RISK BREAKDOWN" open={expanded.risk ?? true} onToggle={() => toggle('risk')}>
          {(analysis.risk_breakdown || []).length ? <div className="space-y-2">{analysis.risk_breakdown.map((item: AnyRecord, index: number) => <div key={`${item.source}-${index}`} className="flex justify-between gap-3 text-xs border-b border-[#151D28] pb-2"><span className="text-gray-300">{item.reason || item.title || item.source}</span><span className="text-yellow-400 font-mono">+{item.points ?? item.weight ?? 0}</span></div>)}</div> : <Empty text="No scored contributions." />}
        </Panel>
      </div>

      <Panel title="LOCAL CONTENT, URL, ATTACHMENT & PROVIDER STATE" open={expanded.details ?? false} onToggle={() => toggle('details')}>
        <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">{JSON.stringify({ url_analysis: analysis.url_analysis, domain_analysis: analysis.domain_analysis, attachment_analysis: analysis.attachment_analysis, content_analysis: analysis.content_analysis, ml_analysis: analysis.ml_analysis, threat_intelligence: analysis.threat_intelligence }, null, 2)}</pre>
      </Panel>

      <div className="text-xs text-gray-500"><Link className="text-cyan-500 hover:underline" to="/history">Return to analysis history</Link></div>
    </div>
  );
}

function Panel({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <section className="bg-[#080D14] p-5 border border-[#151D28] rounded"><button onClick={onToggle} className="w-full flex items-center gap-2 text-left text-xs font-bold text-cyan-500 uppercase tracking-wider">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}{title}</button>{open && <div className="mt-4">{children}</div>}</section>;
}

function Metric({ title, value, tone }: { title: string; value: string; tone: string }) {
  return <div className="bg-[#080D14] p-5 border border-[#151D28] rounded"><p className="text-[10px] text-gray-500 font-bold uppercase">{title}</p><p className={`text-xl font-bold mt-2 ${tone}`}>{value}</p></div>;
}

function FindingList({ findings }: { findings: AnyRecord[] }) {
  if (!findings.length) return <Empty text="No deterministic findings recorded." />;
  return <div className="space-y-3">{findings.map((finding, index) => <div key={`${finding.finding_id || finding.title}-${index}`} className="border border-[#1c2a3d] rounded p-3"><div className="flex justify-between gap-3"><span className="text-sm text-gray-200">{finding.title || finding.finding_id}</span><span className="text-[10px] uppercase text-yellow-400">{finding.severity || 'info'}</span></div><p className="text-xs text-gray-400 mt-1">{finding.description || ''}</p></div>)}</div>;
}

function Empty({ text }: { text: string }) { return <p className="text-xs text-gray-500 font-mono">{text}</p>; }
function riskTone(score: number) { return score >= 75 ? 'text-red-400' : score >= 40 ? 'text-yellow-400' : 'text-green-400'; }
function verdictTone(verdict: string) { return verdict === 'malicious' ? 'text-red-400' : verdict === 'suspicious' ? 'text-yellow-400' : 'text-green-400'; }
function severityTone(severity: string) { return severity === 'critical' || severity === 'high' ? 'text-red-400' : severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'; }
