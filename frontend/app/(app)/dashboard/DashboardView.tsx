'use client';

import { useRouter } from 'next/navigation';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAlertStats } from '@/hooks/useAlertStats';
import { useAlertTimeline } from '@/hooks/useAlertTimeline';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Activity, Search, CheckCircle2, ExternalLink } from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#3b82f6',
  info:     '#64748b',
};

const STATUS_COLORS: Record<string, string> = {
  new:            '#38bdf8',
  investigating:  '#fbbf24',
  resolved:       '#22c55e',
  false_positive: '#64748b',
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4 relative group">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-semibold mt-1 font-mono tabular-nums" style={{ color }}>
          {value.toLocaleString()}
        </p>
      </div>
      <div className="rounded-lg p-2.5 mt-0.5 shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title={`Open ${title} in alerts`}
      >
        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      </a>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">{title}</p>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 8%)',
  border: '1px solid hsl(217, 33%, 20%)',
  borderRadius: '6px',
  fontSize: '12px',
  color: 'hsl(210, 40%, 96%)',
};

export default function DashboardView() {
  const router = useRouter();
  const { data, isLoading } = useAlertStats();
  const { data: timeline } = useAlertTimeline(30);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalAlerts = data.bySeverity.reduce((s: number, r: any) => s + r.count, 0);
  const criticalCount = data.bySeverity.find((r: any) => r.severity === 'critical')?.count ?? 0;
  const openCount = data.byStatus
    .filter((r: any) => r.status === 'new' || r.status === 'investigating')
    .reduce((s: number, r: any) => s + r.count, 0);
  const investigatingCount = data.byStatus.find((r: any) => r.status === 'investigating')?.count ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Alerts"   value={totalAlerts}        icon={Activity}       color="#94a3b8" href="/alerts" />
        <StatCard title="Critical"       value={criticalCount}      icon={AlertTriangle}  color="#ef4444" href="/alerts?severity=critical" />
        <StatCard title="Open"           value={openCount}          icon={Search}         color="#f97316" href="/alerts?status=new%2Cinvestigating" />
        <StatCard title="Investigating"  value={investigatingCount} icon={CheckCircle2}   color="#38bdf8" href="/alerts?status=investigating" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="By Severity">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.bySeverity}
                dataKey="count"
                nameKey="severity"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                onClick={(item) => router.push(`/alerts?${new URLSearchParams({ severity: item.severity })}`)}
                className="cursor-pointer"
              >
                {data.bySeverity.map((entry: any) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? '#64748b'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'hsl(210, 40%, 96%)' }}
                labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
                formatter={(v: number) => [v, 'Alerts']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By Category">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byCategory} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(217, 33%, 14%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={115} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'hsl(210, 40%, 96%)' }}
                labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar
                dataKey="count"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
                onClick={(value) => router.push(`/alerts?${new URLSearchParams({ category: value.category })}`)}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By Status">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byStatus} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 33%, 14%)" />
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'hsl(210, 40%, 96%)' }}
                labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                onClick={(item) => router.push(`/alerts?${new URLSearchParams({ status: item.status })}`)}
                className="cursor-pointer"
              >
                {data.byStatus.map((entry: any) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {timeline && timeline.length > 0 && (
        <ChartCard title="Alert Volume — Last 30 Days">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 33%, 14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'hsl(210, 40%, 96%)' }}
                labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fill="url(#timelineGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
