'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/alert';

interface Props {
  alerts: Alert[];
  isLoading: boolean;
  selectedId: string | null;
  onSort: (field: 'timestamp' | 'severity') => void;
  sortBy?: string;
  sortOrder?: string;
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy?: string; sortOrder?: string }) {
  if (sortBy !== field) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-30" />;
  if (sortOrder === 'asc') return <ChevronUp className="h-3 w-3 ml-1 text-green-500" />;
  return <ChevronDown className="h-3 w-3 ml-1 text-green-500" />;
}

export default function AlertsTable({ alerts, isLoading, selectedId, onSort, sortBy, sortOrder }: Props) {
  const router = useRouter();

  function handleRowClick(id: string) {
    const params = new URLSearchParams(window.location.search);
    params.set('alertId', id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  if (isLoading) {
    return (
      <div className="space-y-1.5 p-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead
              className="cursor-pointer select-none text-xs font-medium uppercase tracking-wide text-muted-foreground"
              onClick={() => onSort('timestamp')}
            >
              <span className="flex items-center">
                Time
                <SortIcon field="timestamp" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</TableHead>
            <TableHead
              className="cursor-pointer select-none text-xs font-medium uppercase tracking-wide text-muted-foreground"
              onClick={() => onSort('severity')}
            >
              <span className="flex items-center">
                Severity
                <SortIcon field="severity" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Asset</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">
                No alerts match the current filters
              </TableCell>
            </TableRow>
          ) : (
            alerts.map((alert) => (
              <TableRow
                key={alert.id}
                className={cn(
                  'cursor-pointer border-border transition-colors duration-100',
                  selectedId === alert.id
                    ? 'bg-green-500/5 border-l-2 border-l-green-500'
                    : 'hover:bg-muted/40',
                )}
                onClick={() => handleRowClick(alert.id)}
              >
                <TableCell className="text-xs whitespace-nowrap font-mono text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-sm font-medium">{alert.title}</TableCell>
                <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
                <TableCell><StatusBadge status={alert.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{alert.category.replace(/_/g, ' ')}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{alert.source}</TableCell>
                <TableCell className="text-xs font-mono truncate max-w-[130px] text-muted-foreground">{alert.affectedAsset}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{alert.assignee ?? '—'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
