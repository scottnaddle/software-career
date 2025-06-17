import { useState, useEffect } from 'react';
import { supabase, Career } from '../lib/supabase';

export function useCareers(userId?: string) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchCareers();
    }
  }, [userId]);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCareers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCareer = async (careerData: Omit<Career, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .insert([careerData])
        .select()
        .single();

      if (error) throw error;
      setCareers(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error };
    }
  };

  const updateCareer = async (id: string, updates: Partial<Career>) => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCareers(prev => prev.map(career => career.id === id ? data : career));
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error };
    }
  };

  const deleteCareer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('careers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCareers(prev => prev.filter(career => career.id !== id));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      return { error };
    }
  };

  return {
    careers,
    loading,
    error,
    fetchCareers,
    createCareer,
    updateCareer,
    deleteCareer,
  };
}