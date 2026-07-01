import { useState, useEffect, useCallback } from 'react';
import { apiService, DealDto } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function useDeals() {
  const { token } = useAuth();
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.deals.list(token || undefined);
      setDeals(result.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { deals, loading, error, refetch: fetch };
}
