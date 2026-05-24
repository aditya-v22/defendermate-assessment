import { cn } from '@/lib/utils';

const severityConfig: Record<string, { label: string; classes: string }> = {
  critical: { label: 'Critical', classes: 'bg-red-500/15 text-red-500 border-red-500/30' },
  high:     { label: 'High',     classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  medium:   { label: 'Medium',   classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  low:      { label: 'Low',      classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  info:     { label: 'Info',     classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const cfg = severityConfig[severity] ?? { label: severity, classes: 'bg-muted text-muted-foreground border-border' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-mono uppercase tracking-wide', cfg.classes)}>
      {cfg.label}
    </span>
  );
}
