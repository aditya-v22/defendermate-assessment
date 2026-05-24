'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface AlertFilters {
  severity?: string;
  status?: string;
  category?: string;
  source?: string;
  from?: string;
  to?: string;
  search?: string;
  sortBy?: 'timestamp' | 'severity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

function paramsToFilters(params: URLSearchParams): AlertFilters {
  return {
    severity: params.get('severity') ?? undefined,
    status: params.get('status') ?? undefined,
    category: params.get('category') ?? undefined,
    source: params.get('source') ?? undefined,
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
    search: params.get('search') ?? undefined,
    sortBy: (params.get('sortBy') as AlertFilters['sortBy']) ?? undefined,
    sortOrder: (params.get('sortOrder') as AlertFilters['sortOrder']) ?? undefined,
    page: params.get('page') ? parseInt(params.get('page')!, 10) : undefined,
  };
}

function filtersToParams(filters: AlertFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  if (filters.category) params.set('category', filters.category);
  if (filters.source) params.set('source', filters.source);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function useAlertFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoized — paramsToFilters runs on every render but useMemo keeps the reference stable
  // so TanStack Query doesn't see a new key object on each render
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (next: Partial<AlertFilters>) => {
      const merged = { ...filters, ...next };
      // reset to page 1 on any filter change except explicit page nav
      if (!('page' in next)) merged.page = undefined;
      router.push(`?${filtersToParams(merged).toString()}`, { scroll: false });
    },
    [filters, router],
  );

  const toggleSort = useCallback(
    (field: 'timestamp' | 'severity') => {
      const isSame = filters.sortBy === field;
      setFilters({
        sortBy: field,
        sortOrder: isSame && filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    },
    [filters, setFilters],
  );

  return { filters, setFilters, toggleSort };
}
