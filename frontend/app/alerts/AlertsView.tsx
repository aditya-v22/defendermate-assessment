'use client';

import { useSearchParams } from 'next/navigation';
import { useAlertFilters } from '@/hooks/useAlertFilters';
import { useAlerts } from '@/hooks/useAlerts';
import AlertsFilters from '@/components/alerts/AlertsFilters';
import AlertsTable from '@/components/alerts/AlertsTable';
import AlertDetailPanel from '@/components/alerts/AlertDetailPanel';
import Pagination from '@/components/alerts/Pagination';

export default function AlertsView() {
  const { filters, setFilters, toggleSort } = useAlertFilters();
  const { data, isLoading } = useAlerts(filters);
  const searchParams = useSearchParams();
  const selectedAlertId = searchParams.get('alertId');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Alerts</h1>
        {data?.meta && (
          <span className="text-xs text-muted-foreground font-mono">
            {data.meta.total.toLocaleString()} total
          </span>
        )}
      </div>

      <AlertsFilters filters={filters} onChange={setFilters} />

      <div className="flex gap-4">
        <div className={selectedAlertId ? 'flex-1 min-w-0' : 'w-full'}>
          <AlertsTable
            alerts={data?.data ?? []}
            isLoading={isLoading}
            selectedId={selectedAlertId}
            onSort={toggleSort}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />
          {data?.meta && data.meta.totalPages > 1 && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(p) => setFilters({ page: p })}
            />
          )}
        </div>
        {selectedAlertId && <AlertDetailPanel alertId={selectedAlertId} />}
      </div>
    </div>
  );
}
