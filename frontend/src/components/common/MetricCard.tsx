interface MetricCardProps {
  title: string;
  value: string | number;
  tone?: 'text-cyan-400' | 'text-red-400' | 'text-yellow-400' | 'text-orange-400' | 'text-gray-400';
  className?: string;
}

export function MetricCard({ title, value, tone = 'text-cyan-400', className = '' }: MetricCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-lg border border-[#1b3037] bg-[#101b21]/90 p-5 shadow-[0_16px_40px_rgba(2,12,15,0.2)] transition-all hover:-translate-y-0.5 hover:border-[#3b5e60] ${className}`}>
      <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-[#58d6c0]/[0.035] transition-transform group-hover:scale-125" />
      <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#718581]">{title}</p>
      <p className={`relative mt-3 font-mono text-3xl font-semibold tracking-tight ${tone}`}>{value}</p>
      <div className="relative mt-4 h-px bg-gradient-to-r from-[#31514e] to-transparent" />
      <p className="relative mt-2 font-mono text-[9px] uppercase tracking-wider text-[#516963]">persisted signal</p>
    </div>
  );
}
