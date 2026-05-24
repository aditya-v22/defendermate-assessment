import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useAlertStats() {
  return useQuery({
    queryKey: ['alertStats'],
    queryFn: async () => {
      const res = await api.get('/alerts/stats');
      return res.data;
    },
  });
}
