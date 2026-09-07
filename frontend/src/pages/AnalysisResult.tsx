import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Download, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { downloadReport, getAnalysisById } from '../services/analysisApi';
import { categorizeIoc } from '../utils/iocCategorization';

type AnyRecord = Record<string, any>;

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    reasoning: true,
    authentication: true,
    attackChain: true,
    findings: true
  });

  useEffect(() => {
    if (!id) return;
    getAnalysisById(id)
      .then(setAnalysis)
      .catch(() => setError('Failed to load analysis. Ensure backend is running.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-cyan-400 font-mono text-sm animate-pulse">LOADING FORENSIC ANALYSIS...</div>;
  if (error || !analysis) return <div className="p-6 text-red-400 font-mono text-sm">{error || 'Analysis not found.'}</div>;

  const authentication = analysis.authentication || {};
  const findings = analysis.forensic_findings || [];
  const iocs = extractedIocs(analysis);
  const toggle = (key: string) => setExpanded((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      <div className="flex flex-wrap justify-between gap-3 border-b border-[#151D28] pb-4">
        <div>
          <p className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">Forensic Analysis Report</p>
          <h1 className="text-xl font-bold break-all font-mono text-cyan-400">{analysis.analysis_id}</h1>
          <p className="text-xs text-gray-400 mt-1">{analysis.summary}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => id && downloadReport(id, 'json')} className="px-3 py-2 text-xs border border-[#263449] rounded hover:border-cyan-500 flex items-center gap-2"><Download size={13} /> JSON</button>
          <button onClick={() => id && downloadReport(id, 'html')} className="px-3 py-2 text-xs border border-[#263449] rounded hover:border-cyan-500 flex items-center gap-2"><Download size={13} /> PRINTABLE HTML</button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric title="RISK SCORE" value={`${analysis.risk_score} / 100`} tone={riskTone(analysis.risk_score)} />
        <Metric title="VERDICT" value={String(analysis.verdict).toUpperCase()} tone={verdictTone(analysis.verdict)} />
        <Metric title="SEVERITY" value={String(analysis.severity).toUpperCase()} tone={severityTone(analysis.severity)} />
        <div className="bg-[#080D14] p-5 border border-[#151D28] rounded">
          <div className="flex items-center gap-1">
             <p className="text-[10px] text-gray-500 font-bold uppercase">DETECTION EVIDENCE CONFIDENCE</p>
             <div className="group relative">
                <Info size={12} className="text-gray-600 hover:text-cyan-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-[#05080D] border border-[#151D28] text-[10px] text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-10 pointer-events-none">
                    Represents telemetry completeness and forensic metadata depth, not malice probability.
                </div>
             </div>
          </div>
          <p className={`text-xl font-bold mt-2 text-cyan-400`}>{analysis.confidence}%</p>
        </div>
      </div>

      {/* Authentication & Forensics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="AUTHENTICATION & IDENTITY" open={expanded.authentication ?? true} onToggle={() => toggle('authentication')}>
            <div className="grid grid-cols-2 gap-3">
              {(['spf', 'dkim', 'dmarc', 'arc'] as const).map((name) => {
                const item = authentication[name] || {};
                return <Metric key={name} title={name} value={String(item.status || 'missing').toUpperCase()} tone={item.status === 'pass' ? 'text-green-400' : item.status === 'fail' ? 'text-red-400' : 'text-gray-400'} />;
              })}
            </div>
        </Panel>

        <Panel title="THREAT REASONING" open={expanded.reasoning ?? true} onToggle={() => toggle('reasoning')} className="lg:col-span-2">
            <p className="text-sm text-gray-300 mb-4">{analysis.extended_reasoning?.summary || analysis.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-red-400 font-bold tracking-wider">Risk-Contributing Evidence</p>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                  {(analysis.risk_breakdown || []).filter((item: any) => item.points > 5).map((item: any, i: number) => <li key={i}>{item.reason} <span className="text-[10px] text-gray-600">(+{item.points})</span></li>)}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-yellow-400 font-bold tracking-wider">Contextual Observations</p>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                  {(analysis.risk_breakdown || []).filter((item: any) => item.points <= 5).map((item: any, i: number) => <li key={i}>{item.reason}</li>)}
                  {findings.filter((f: any) => f.severity === 'info').map((f: any, i: number) => <li key={i}>{f.title}</li>)}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-green-400 font-bold tracking-wider">Informational Evidence</p>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                  {(['spf', 'dkim', 'dmarc'] as const).filter(proto => authentication[proto]?.status === 'pass').map((proto, i) => <li key={i}>{proto.toUpperCase()} record alignment verified.</li>)}
                </ul>
              </div>
            </div>
        </Panel>
      </div>

      {/* Attack Chain */}
      <Panel title={`ATTACK CHAIN (${(analysis.attack_chain_steps || []).length})`} open={expanded.attackChain ?? true} onToggle={() => toggle('attackChain')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(analysis.attack_chain_steps || []).map((step: AnyRecord, index: number) => <div key={`${step.stage}-${index}`} className="border border-[#1c2a3d] rounded p-3"><div className="text-xs font-bold text-cyan-400">{step.title || step.stage}</div><div className="text-[10px] text-gray-500 uppercase mt-1">{step.status || 'observed'}</div><ul className="mt-2 text-xs text-gray-400 list-disc pl-4">{(step.evidence || []).map((evidence: string, evidenceIndex: number) => <li key={evidenceIndex}>{evidence}</li>)}</ul></div>)}
        </div>
      </Panel>

      {/* Findings, IOCs, Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={`FORENSIC FINDINGS (${findings.length})`} open={expanded.findings ?? true} onToggle={() => toggle('findings')}>
          <FindingList findings={findings} />
        </Panel>

        <Panel title={`EXTRACTED ARTIFACTS & IOCs (${iocs.length})`} open={expanded.iocs ?? false} onToggle={() => toggle('iocs')}>
          {iocs.length ? (
            <div className="space-y-4">
              {(['Actual IOC', 'Infrastructure', 'Forensic Artifact'] as const).map(category => {
                const categoryIocs = iocs.filter((ioc: AnyRecord) => categorizeIoc(ioc) === category);
                if (!categoryIocs.length) return null;
                return (
                  <div key={category} className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                      <span className={category === 'Actual IOC' ? 'text-red-400' : category === 'Infrastructure' ? 'text-yellow-400' : 'text-cyan-400'}>●</span>
                      {category}s ({categoryIocs.length})
                    </p>
                    <div className="space-y-1 pl-3 border-l border-[#151D28]">
                      {categoryIocs.map((ioc: AnyRecord, index: number) => (
                        <div key={`${ioc.type}-${ioc.normalized_value || ioc.value}-${index}`} className="border-b border-[#151D28]/40 pb-1 flex justify-between gap-2">
                          <span className="text-xs text-gray-300 break-all">{ioc.normalized_value || ioc.value}</span>
                          <span className="text-[10px] text-gray-500 font-mono shrink-0">{ioc.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty text="No IOCs extracted." />}
        </Panel>
      </div>

       <div className="text-xs text-gray-500"><Link className="text-cyan-500 hover:underline" to="/history">Return to analysis history</Link></div>
    </div>
  );
}

function Panel({ title, open, onToggle, children, className = "" }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode; className?: string }) {
  return <section className={`bg-[#080D14] p-5 border border-[#151D28] rounded ${className}`}><button onClick={onToggle} className="w-full flex items-center gap-2 text-left text-xs font-bold text-cyan-500 uppercase tracking-wider">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}{title}</button>{open && <div className="mt-4">{children}</div>}</section>;
}

function Metric({ title, value, tone }: { title: string; value: string; tone: string }) {
  return <div className="bg-[#080D14] p-5 border border-[#151D28] rounded"><p className="text-[10px] text-gray-500 font-bold uppercase">{title}</p><p className={`text-xl font-bold mt-2 ${tone}`}>{value}</p></div>;
}

function FindingList({ findings }: { findings: AnyRecord[] }) {
  if (!findings.length) return <Empty text="No deterministic findings recorded." />;
  return <div className="space-y-3">{findings.map((finding, index) => <div key={`${finding.finding_id || finding.title}-${index}`} className="border border-[#1c2a3d] rounded p-3"><div className="flex justify-between gap-3"><span className="text-sm text-gray-200">{finding.title || finding.finding_id}</span><span className={`text-[10px] uppercase ${severityToneLabel(finding.severity)}`}>{finding.severity || 'info'}</span></div><p className="text-xs text-gray-400 mt-1">{finding.description || ''}</p></div>)}</div>;
}

function Empty({ text }: { text: string }) { return <p className="text-xs text-gray-500 font-mono">{text}</p>; }
function riskTone(score: number) { return score >= 75 ? 'text-red-400' : score >= 40 ? 'text-yellow-400' : 'text-green-400'; }
function verdictTone(verdict: string) { return verdict === 'malicious' ? 'text-red-400' : verdict === 'suspicious' ? 'text-yellow-400' : 'text-green-400'; }
function severityTone(severity: string) { return severity === 'critical' || severity === 'high' ? 'text-red-400' : severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'; }
function severityToneLabel(severity: string) { return severity === 'critical' || severity === 'high' ? 'text-red-400' : severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'; }

function extractedIocs(analysis: AnyRecord) {
    if (analysis.extracted_iocs && analysis.extracted_iocs.iocs) return analysis.extracted_iocs.iocs;
    if (analysis.iocs && Array.isArray(analysis.iocs)) return analysis.iocs;
    return [];
}
