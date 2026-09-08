interface MetricCardProps {
  title: string;
  value: string | number;
  tone?: 'text-cyan-400' | 'text-red-400' | 'text-yellow-400' | 'text-orange-400' | 'text-gray-400';
  className?: string;
}

export function MetricCard({ title, value, tone = 'text-cyan-400', className = '' }: MetricCardProps) {
  return (
    <div className={`bg-[#080D14] p-4 rounded border border-[#151D28] ${className}`}>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}
