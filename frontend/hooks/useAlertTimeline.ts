import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useAlertTimeline(days = 30) {
  return useQuery({
    queryKey: ['alertTimeline', days],
    queryFn: async () => {
      const res = await api.get(`/alerts/timeline?days=${days}`);
      return res.data;
    },
  });
}
