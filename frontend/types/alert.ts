export interface Alert {
  id: string;
  timestamp: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  severityRank: number;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  category: string;
  source: string;
  affectedAsset: string;
  assignee: string | null;
  description: string;
  rawEvent: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AlertsResponse {
  data: Alert[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AlertStats {
  bySeverity: { severity: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

export type AlertTimeline = { date: string; count: number }[];
