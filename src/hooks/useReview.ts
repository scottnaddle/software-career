import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { ReviewRequest, ReviewResult } from './useExpert';

export const useReview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 검토 요청 생성
  const createReviewRequest = async (
    careerId: string,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      deadline?: Date;
      expertId?: string;
    }
  ) => {
    if (!user) throw new Error('로그인이 필요합니다.');

    try {
      setLoading(true);

      // 기본 검토 비용 계산 (우선순위에 따라)
      const baseFee = 50000; // 기본 5만원
      const priorityMultiplier = {
        low: 0.8,
        normal: 1.0,
        high: 1.5,
        urgent: 2.0,
      };
      const reviewFee = baseFee * (priorityMultiplier[options?.priority || 'normal']);

      const { data, error } = await supabase
        .from('review_requests')
        .insert([
          {
            career_id: careerId,
            requester_id: user.id,
            expert_id: options?.expertId,
            priority: options?.priority || 'normal',
            deadline: options?.deadline?.toISOString(),
            review_fee: reviewFee,
            status: options?.expertId ? 'assigned' : 'pending',
            assigned_at: options?.expertId ? new Date().toISOString() : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 알림 생성
      if (options?.expertId) {
        await createNotification(
          options.expertId,
          'review_assigned',
          '새로운 검토 요청',
          '새로운 경력 검토 요청이 배정되었습니다.',
          { review_request_id: data.id }
        );
      }

      return data;
    } catch (error) {
      console.error('Error creating review request:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 사용자의 검토 요청 목록 조회
  const getUserReviewRequests = async (userId?: string) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('review_requests')
        .select(`
          *,
          careers(title, company, type),
          experts(user_id, rating, specializations),
          review_results(verification_status, confidence_score, feedback)
        `)
        .eq('requester_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user review requests:', error);
      return [];
    }
  };

  // 전문가의 배정된 검토 요청 조회
  const getExpertReviewRequests = async (expertId?: string) => {
    try {
      if (!expertId && !user) return [];

      let query = supabase
        .from('review_requests')
        .select(`
          *,
          careers(title, company, type, description, start_date, end_date),
          users(name, email)
        `)
        .order('created_at', { ascending: false });

      if (expertId) {
        query = query.eq('expert_id', expertId);
      } else {
        // 현재 사용자가 전문가인 경우
        const { data: expertData } = await supabase
          .from('experts')
          .select('id')
          .eq('user_id', user!.id)
          .single();

        if (expertData) {
          query = query.eq('expert_id', expertData.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expert review requests:', error);
      return [];
    }
  };

  // 검토 요청 상태 업데이트
  const updateReviewRequestStatus = async (
    requestId: string,
    status: ReviewRequest['status'],
    updates?: Partial<ReviewRequest>
  ) => {
    try {
      setLoading(true);

      const updateData: any = { status, ...updates };

      // 상태에 따른 타임스탬프 업데이트
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('review_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // 상태 변경 알림
      if (status === 'completed') {
        await createNotification(
          data.requester_id,
          'review_completed',
          '검토 완료',
          '경력 검토가 완료되었습니다.',
          { review_request_id: requestId }
        );
      }

      return data;
    } catch (error) {
      console.error('Error updating review request status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 검토 결과 제출
  const submitReviewResult = async (
    requestId: string,
    result: Omit<ReviewResult, 'id' | 'review_request_id' | 'expert_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) throw new Error('로그인이 필요합니다.');

    try {
      setLoading(true);

      // 전문가 ID 조회
      const { data: expertData } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!expertData) throw new Error('전문가 프로필을 찾을 수 없습니다.');

      // 검토 결과 저장
      const { data: reviewResult, error: resultError } = await supabase
        .from('review_results')
        .insert([
          {
            review_request_id: requestId,
            expert_id: expertData.id,
            ...result,
          },
        ])
        .select()
        .single();

      if (resultError) throw resultError;

      // 검토 요청 상태를 완료로 업데이트
      await updateReviewRequestStatus(requestId, 'completed');

      // 경력 정보에 검토 결과 반영
      const { data: requestData } = await supabase
        .from('review_requests')
        .select('career_id, requester_id')
        .eq('id', requestId)
        .single();

      if (requestData) {
        const careerStatus = result.verification_status === 'verified' ? 'verified' : 'rejected';
        await supabase
          .from('careers')
          .update({
            status: careerStatus,
            verification_date: new Date().toISOString(),
            verification_notes: result.feedback,
          })
          .eq('id', requestData.career_id);
      }

      return reviewResult;
    } catch (error) {
      console.error('Error submitting review result:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 검토 결과 조회
  const getReviewResult = async (requestId: string): Promise<ReviewResult | null> => {
    try {
      const { data, error } = await supabase
        .from('review_results')
        .select(`
          *,
          experts(user_id, rating, specializations, company, position)
        `)
        .eq('review_request_id', requestId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching review result:', error);
      return null;
    }
  };

  // 전문가 검토 요청 수락
  const acceptReviewRequest = async (requestId: string) => {
    try {
      // 현재 사용자의 전문가 ID 조회
      const { data: expertData } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!expertData) throw new Error('전문가 프로필을 찾을 수 없습니다.');

      return await updateReviewRequestStatus(requestId, 'assigned', {
        expert_id: expertData.id,
        assigned_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error accepting review request:', error);
      throw error;
    }
  };

  // 알림 생성 헬퍼 함수
  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    data: any = {}
  ) => {
    try {
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // 미배정 검토 요청 목록 (전문가용)
  const getUnassignedReviewRequests = async (specializations?: string[]) => {
    try {
      let query = supabase
        .from('review_requests')
        .select(`
          *,
          careers(title, company, type, description, technologies),
          users(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // 클라이언트 사이드에서 특기 분야 필터링 (더 복잡한 로직을 위해)
      if (specializations?.length && data) {
        return data.filter(request => {
          const careerTechnologies = request.careers?.technologies || [];
          const careerType = request.careers?.type;
          
          return specializations.some(spec => 
            careerTechnologies.includes(spec) || 
            spec.toLowerCase() === careerType?.toLowerCase()
          );
        });
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching unassigned review requests:', error);
      return [];
    }
  };

  return {
    loading,
    createReviewRequest,
    getUserReviewRequests,
    getExpertReviewRequests,
    updateReviewRequestStatus,
    submitReviewResult,
    getReviewResult,
    acceptReviewRequest,
    getUnassignedReviewRequests,
  };
};

export default useReview;