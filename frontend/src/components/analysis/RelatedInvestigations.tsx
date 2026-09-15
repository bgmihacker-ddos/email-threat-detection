import React from 'react';
import { Link } from 'react-router-dom';
import { Network, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

export interface RelatedInvestigation {
  analysis_id: string;
  overlap_type: string[];
  shared_iocs: string[];
  shared_indicator_count: number;
  confidence: number;
  verdict?: string;
  severity?: string;
  created_at?: string;
}

interface RelatedInvestigationsProps {
  related: RelatedInvestigation[];
}

export const RelatedInvestigations: React.FC<RelatedInvestigationsProps> = ({ related }) => {
  if (!related || related.length === 0) {
    return (
      <div className="rounded-lg border border-[#1b3037] bg-[#0b171c] p-5">
        <div className="flex items-center gap-2 text-gray-400">
          <Network size={16} className="text-cyan-400" />
          <h3 className="font-semibold text-white">Cross-Case Campaign Correlation</h3>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          No historical campaign correlation or shared threat infrastructure detected for this case.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-cyan-500/30 bg-[#0b171c] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="report-kicker">Campaign Intelligence</p>
          <div className="flex items-center gap-2 mt-1">
            <Network size={18} className="text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Cross-Case Correlation ({related.length})</h2>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded border border-cyan-500/40 text-cyan-300 bg-cyan-950/20">
          Correlated Threat Cluster
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        The forensic engine detected matching infrastructure (URLs, IPs, sender domains, or attachment hashes) linking this email to prior investigations in your repository.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {related.map((item, idx) => {
          const isMalicious = item.verdict?.toLowerCase() === 'malicious' || item.severity?.toLowerCase() === 'critical' || item.severity?.toLowerCase() === 'high';
          return (
            <div key={item.analysis_id || idx} className="rounded border border-[#29454b] bg-[#101b21] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isMalicious ? (
                      <ShieldAlert size={16} className="text-red-400 shrink-0" />
                    ) : (
                      <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    )}
                    <Link
                      to={`/analysis/${item.analysis_id}`}
                      className="font-mono text-xs font-semibold text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      Case {item.analysis_id.slice(0, 12)}...
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <span className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${isMalicious ? 'border-red-500/40 text-red-300 bg-red-950/30' : 'border-gray-600 text-gray-300'}`}>
                    {item.verdict || 'SUSPICIOUS'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(item.overlap_type || []).map((t, i) => (
                    <span key={i} className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1b3037] text-gray-300 border border-[#29454b]">
                      {t.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {item.shared_iocs && item.shared_iocs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Shared Indicators:</p>
                    <div className="space-y-1">
                      {item.shared_iocs.slice(0, 3).map((ioc, i) => (
                        <div key={i} className="font-mono text-[11px] text-amber-300/90 truncate bg-[#081216] px-2 py-1 rounded border border-[#1b3037]">
                          {ioc}
                        </div>
                      ))}
                      {item.shared_iocs.length > 3 && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          +{item.shared_iocs.length - 3} more overlapping IOCs
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#1b3037] flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Confidence: <strong className="text-cyan-300">{item.confidence}%</strong></span>
                <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Historical'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
export default RelatedInvestigations;
