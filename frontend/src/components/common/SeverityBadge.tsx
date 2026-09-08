import { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity | 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical' | string;
  className?: string;
  dotOnly?: boolean;
}

export function SeverityBadge({ severity, className = '', dotOnly = false }: SeverityBadgeProps) {
  const sev = String(severity).toLowerCase();

  let colors = 'bg-gray-500/10 text-gray-400 border-gray-500/20'; // default
  let dotColor = 'bg-gray-400';

  if (sev === 'critical') {
    colors = 'bg-[#3b2424] text-[#f2aaa2] border-[#ed756d]/30';
    dotColor = 'bg-[#ed756d]';
  } else if (sev === 'high' || sev === 'malicious') {
    colors = 'bg-red-950/40 text-red-400 border-red-500/30';
    dotColor = 'bg-red-400';
  } else if (sev === 'medium' || sev === 'suspicious') {
    colors = 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
    dotColor = 'bg-yellow-400';
  } else if (sev === 'low') {
    colors = 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30';
    dotColor = 'bg-cyan-400';
  } else if (sev === 'safe' || sev === 'benign' || sev === 'clean') {
    colors = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  } else if (sev === 'info') {
    colors = 'bg-blue-950/40 text-blue-400 border-blue-500/30';
    dotColor = 'bg-blue-400';
  }

  if (dotOnly) {
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor} ${className}`} title={String(severity).toUpperCase()} />;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor} animate-pulse-slow`}></span>
      {severity}
    </span>
  );
}
