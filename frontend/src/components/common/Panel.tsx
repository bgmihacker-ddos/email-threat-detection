import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PanelProps {
  title: string;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, open = true, onToggle, children, className = '' }: PanelProps) {
  return (
    <section className={`bg-[#080D14] p-5 border border-[#151D28] rounded ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 text-left text-xs font-bold text-cyan-500 uppercase tracking-wider disabled:cursor-default"
        disabled={!onToggle}
      >
        {onToggle && (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        {title}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}
