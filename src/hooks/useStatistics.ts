import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Statistic {
  id: string;
  metric_name: string;
  metric_value: number;
  date: string;
  metadata: any;
  created_at: string;
}

export function useStatistics() {
  const [statistics, setStatistics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert array to object for easier access
      const statsObject = (data || []).reduce((acc: Record<string, number>, stat: Statistic) => {
        acc[stat.metric_name] = stat.metric_value;
        return acc;
      }, {});

      setStatistics(statsObject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    statistics,
    loading,
    error,
    fetchStatistics,
  };
}