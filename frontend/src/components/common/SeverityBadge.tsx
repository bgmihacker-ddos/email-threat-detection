import { Severity } from '../../types/threats';
import { twMerge } from 'tailwind-merge';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig: Record<Severity, string> = {
  Safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={twMerge(
        'px-2 py-1 rounded-full text-xs font-medium uppercase',
        severityConfig[severity],
        className
      )}
    >
      {severity}
    </span>
  );
}
