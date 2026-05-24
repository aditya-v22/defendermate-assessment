'use client';

import { useState, useCallback } from 'react';

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

export function useAlertFilters() {
  const [filters, setFiltersState] = useState<AlertFilters>({});

  const setFilters = useCallback((next: Partial<AlertFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next, page: undefined }));
  }, []);

  return { filters, setFilters };
}
