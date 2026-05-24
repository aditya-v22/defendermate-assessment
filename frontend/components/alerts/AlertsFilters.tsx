'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { AlertFilters } from '@/hooks/useAlertFilters';
import { ChevronDown, X, Search } from 'lucide-react';

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];
const STATUS_OPTIONS = ['new', 'investigating', 'resolved', 'false_positive'];
const CATEGORY_OPTIONS = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];
const SOURCE_OPTIONS = ['endpoint-agent', 'email-gateway', 'firewall', 'cloud-audit'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-blue-400',
  info: 'text-slate-400',
};

function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
  colorMap,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (val: string | undefined) => void;
  colorMap?: Record<string, string>;
}) {
  const selected = value ? value.split(',') : [];

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.length ? next.join(',') : undefined);
  }

  const active = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 gap-1.5 text-xs border-border',
            active && 'border-green-500/50 bg-green-500/5 text-green-400',
          )}
        >
          {label}
          {active && (
            <span className="rounded-full bg-green-500/20 text-green-400 text-xs px-1.5 py-0 leading-4">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5 bg-card border-border z-50" align="start">
        <div className="space-y-0.5">
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-xs',
                'hover:bg-muted transition-colors',
                selected.includes(opt) && 'bg-muted',
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-green-500 w-3 h-3"
              />
              <span className={cn(colorMap?.[opt] ?? 'text-foreground')}>
                {opt.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface Props {
  filters: AlertFilters;
  onChange: (f: Partial<AlertFilters>) => void;
}

export default function AlertsFilters({ filters, onChange }: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // no cleanup on unmount — debounce fires stale after unmount
    debounceRef.current = setTimeout(() => {
      onChange({ search: val || undefined });
    }, 400);
  }

  const hasFilters =
    filters.severity ||
    filters.status ||
    filters.category ||
    filters.source ||
    filters.from ||
    filters.to ||
    filters.search;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <MultiSelectFilter
        label="Severity"
        options={SEVERITY_OPTIONS}
        value={filters.severity}
        onChange={(v) => onChange({ severity: v })}
        colorMap={SEVERITY_COLORS}
      />
      <MultiSelectFilter
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(v) => onChange({ status: v })}
      />
      <MultiSelectFilter
        label="Category"
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={(v) => onChange({ category: v })}
      />
      <MultiSelectFilter
        label="Source"
        options={SOURCE_OPTIONS}
        value={filters.source}
        onChange={(v) => onChange({ source: v })}
      />

      <div className="flex gap-2 items-center">
        <Input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
          className="h-8 text-xs w-36 border-border bg-background"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <Input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
          className="h-8 text-xs w-36 border-border bg-background"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search alerts…"
          defaultValue={filters.search ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-8 w-52 text-xs pl-7 border-border bg-background"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground gap-1 hover:text-foreground"
          onClick={() =>
            onChange({
              severity: undefined,
              status: undefined,
              category: undefined,
              source: undefined,
              from: undefined,
              to: undefined,
              search: undefined,
            })
          }
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
