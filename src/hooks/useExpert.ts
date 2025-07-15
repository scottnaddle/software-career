import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Expert {
  id: string;
  user_id: string;
  expert_type: 'individual' | 'organization';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  specializations: string[];
  experience_years: number;
  education?: string;
  certifications?: string[];
  company?: string;
  position?: string;
  bio?: string;
  linkedin_url?: string;
  website_url?: string;
  hourly_rate?: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ReviewRequest {
  id: string;
  career_id: string;
  requester_id: string;
  expert_id?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requested_at: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  deadline?: string;
  review_fee?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface ReviewResult {
  id: string;
  review_request_id: string;
  expert_id: string;
  verification_status: 'verified' | 'rejected' | 'needs_clarification';
  confidence_score: number;
  feedback: string;
  verification_points: any[];
  issues_found: any[];
  recommendations?: string;
  supporting_documents?: string[];
  time_spent_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface SpecializationCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export const useExpert = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expertProfile, setExpertProfile] = useState<Expert | null>(null);

  // 전문가 프로필 조회
  const getExpertProfile = async (userId?: string): Promise<Expert | null> => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching expert profile:', error);
      return null;
    }
  };

  // 전문가 등록
  const applyAsExpert = async (expertData: Partial<Expert>) => {
    if (!user) throw new Error('로그인이 필요합니다.');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .insert([
          {
            user_id: user.id,
            expert_type: expertData.expert_type || 'individual',
            specializations: expertData.specializations || [],
            experience_years: expertData.experience_years || 0,
            education: expertData.education,
            certifications: expertData.certifications || [],
            company: expertData.company,
            position: expertData.position,
            bio: expertData.bio,
            linkedin_url: expertData.linkedin_url,
            website_url: expertData.website_url,
            hourly_rate: expertData.hourly_rate,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setExpertProfile(data);
      return data;
    } catch (error) {
      console.error('Error applying as expert:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 전문가 프로필 업데이트
  const updateExpertProfile = async (updates: Partial<Expert>) => {
    if (!user || !expertProfile) throw new Error('전문가 프로필이 없습니다.');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setExpertProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating expert profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 승인된 전문가 목록 조회
  const getApprovedExperts = async (filters?: {
    specializations?: string[];
    minRating?: number;
    maxRate?: number;
  }) => {
    try {
      let query = supabase
        .from('experts')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      if (filters?.specializations?.length) {
        query = query.overlaps('specializations', filters.specializations);
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters?.maxRate) {
        query = query.lte('hourly_rate', filters.maxRate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching approved experts:', error);
      throw error;
    }
  };

  // 특기 분야 목록 조회
  const getSpecializationCategories = async (): Promise<SpecializationCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('specialization_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching specialization categories:', error);
      return [];
    }
  };

  // 초기 로드
  useEffect(() => {
    if (user) {
      getExpertProfile().then(setExpertProfile);
    }
  }, [user]);

  return {
    loading,
    expertProfile,
    getExpertProfile,
    applyAsExpert,
    updateExpertProfile,
    getApprovedExperts,
    getSpecializationCategories,
  };
};

export default useExpert;