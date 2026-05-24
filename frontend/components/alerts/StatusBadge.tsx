import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; dot: string; classes: string }> = {
  new:            { label: 'New',           dot: 'bg-sky-400',    classes: 'bg-sky-500/10 text-sky-400 border-sky-500/25' },
  investigating:  { label: 'Investigating', dot: 'bg-amber-400',  classes: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
  resolved:       { label: 'Resolved',      dot: 'bg-green-400',  classes: 'bg-green-500/10 text-green-400 border-green-500/25' },
  false_positive: { label: 'False Positive',dot: 'bg-slate-400',  classes: 'bg-slate-500/10 text-slate-400 border-slate-500/25' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, dot: 'bg-muted-foreground', classes: 'bg-muted text-muted-foreground border-border' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border', cfg.classes)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
