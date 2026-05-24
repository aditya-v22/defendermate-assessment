'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert } from '@/hooks/useAlert';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Link as LinkIcon, Tag, Server, Monitor, User, Clock, Hash } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  alertId: string;
}

const panelBg: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
};

const metaItems = (alert: NonNullable<ReturnType<typeof useAlert>['data']>) => [
  { icon: Tag,     label: 'Category',       value: alert.category.replace(/_/g, ' ') },
  { icon: Server,  label: 'Source',          value: alert.source,          mono: true },
  { icon: Monitor, label: 'Affected Asset',  value: alert.affectedAsset,   mono: true },
  { icon: User,    label: 'Assignee',        value: alert.assignee ?? '—' },
  { icon: Clock,   label: 'Detected',        value: new Date(alert.timestamp).toLocaleString(), mono: true },
  { icon: Hash,    label: 'ID',              value: alert.id.slice(0, 8) + '…', mono: true },
];

export default function AlertDetailPanel({ alertId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: alert, isLoading } = useAlert(alertId);
  const [rawOpen, setRawOpen] = useState(false);

  function close() {
    const params = new URLSearchParams(window.location.search);
    params.delete('alertId');
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }

  const mutation = useMutation({
    mutationFn: (data: { status?: string; severity?: string; assignee?: string | null }) =>
      api.patch(`/alerts/${alertId}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return (
    <div
      className="fixed right-0 top-14 bottom-0 w-[440px] z-40 shadow-2xl border-l border-border overflow-y-auto flex flex-col"
      style={panelBg}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 z-10 shrink-0"
        style={panelBg}
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Alert Detail
          </span>
        </div>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            title="Copy link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={close}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-4 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : alert ? (
        <div className="flex-1 flex flex-col">
          {/* Title block */}
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <div className="flex gap-2 mb-3">
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
            <h2 className="font-semibold text-base leading-snug tracking-tight">
              {alert.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Meta grid */}
          <div className="px-5 py-4 border-b border-border space-y-0">
            {metaItems(alert).map(({ icon: Icon, label, value, mono }) => (
              <div
                key={label}
                className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                <span className={cn(
                  'text-xs truncate',
                  mono ? 'font-mono text-green-400/90' : 'text-foreground',
                )}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-5 py-4 space-y-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Actions
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Update status</label>
              <Select
                value={alert.status}
                onValueChange={(value) => mutation.mutate({ status: value })}
              >
                <SelectTrigger
                  className="h-8 text-xs border-border cursor-pointer"
                  style={{ backgroundColor: 'hsl(var(--background))' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-border hover:border-red-500/50 hover:text-red-400 transition-colors cursor-pointer"
              onClick={() => mutation.mutate({ status: 'false_positive' })}
              disabled={mutation.isPending || alert.status === 'false_positive'}
            >
              Dismiss as false positive
            </Button>
          </div>

          {/* Raw event */}
          <div className="px-5 py-4">
            {/* native button intentional — was iterating quickly on this section */}
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors cursor-pointer"
              onClick={() => setRawOpen((o) => !o)}
            >
              {rawOpen ? '▾ Hide' : '▸ Show'} raw event
            </button>
            {rawOpen && (
              <pre
                className="mt-3 text-xs rounded-lg p-3 overflow-x-auto font-mono leading-relaxed border border-border"
                style={{ backgroundColor: 'hsl(var(--muted))' }}
              >
                {JSON.stringify(alert.rawEvent, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 text-sm text-muted-foreground">Alert not found.</div>
      )}
    </div>
  );
}
