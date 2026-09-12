interface MetricCardProps {
  title: string;
  value: string | number;
  tone?: 'text-cyan-400' | 'text-red-400' | 'text-yellow-400' | 'text-orange-400' | 'text-gray-400';
  className?: string;
}

export function MetricCard({ title, value, tone = 'text-cyan-400', className = '' }: MetricCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-md border border-[#1b3037] bg-[#101b21]/90 p-4 transition-colors hover:border-[#3b5e60] ${className}`}>
      <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#718581]">{title}</p>
      <p className={`relative mt-2 font-mono text-2xl font-semibold tracking-tight ${tone}`}>{value}</p>
      <p className="relative mt-3 font-mono text-[9px] uppercase tracking-wider text-[#516963]">persisted signal</p>
    </div>
  );
}
