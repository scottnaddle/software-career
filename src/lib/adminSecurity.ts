import { supabase } from './supabase';
import { AuthenticationError, AuthorizationError, ValidationError } from '../utils/error';
import { ADMIN_EMAILS } from '../constants';

// Client-side admin verification (should always be paired with server-side checks)
export const verifyAdminAccess = async (): Promise<void> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new AuthenticationError('인증이 필요합니다');
  }

  // Check if user is admin by email
  const isAdminByEmail = ADMIN_EMAILS.includes(user.email || '');

  if (!isAdminByEmail) {
    // Double-check with profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('account_type, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error in admin verification:', profileError);
      throw new AuthorizationError('프로필 정보를 확인할 수 없습니다');
    }

    const isAdminByProfile = profile.account_type === 'admin';
    const isAdminByProfileEmail = ADMIN_EMAILS.includes(profile.email || '');

    console.log('Admin verification check:', {
      userId: user.id,
      userEmail: user.email,
      profileEmail: profile.email,
      profileAccountType: profile.account_type,
      isAdminByEmail,
      isAdminByProfile,
      isAdminByProfileEmail
    });

    if (!isAdminByProfile && !isAdminByProfileEmail) {
      throw new AuthorizationError('관리자 권한이 필요합니다');
    }
  } else {
    console.log('User verified as admin by email:', user.email);
  }
};

// Secure admin operations with server-side validation
export const adminOperations = {
  // Get dashboard stats with server-side validation
  async getDashboardStats() {
    await verifyAdminAccess();
    
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) {
      throw new Error(`대시보드 통계를 가져올 수 없습니다: ${error.message}`);
    }

    return data;
  },

  // Update expert verification status with audit logging
  async updateExpertStatus(
    applicationId: string, 
    status: 'verified' | 'rejected', 
    reason?: string
  ) {
    await verifyAdminAccess();

    if (!applicationId || !['verified', 'rejected'].includes(status)) {
      throw new ValidationError('올바르지 않은 요청입니다');
    }

    const updateData: any = {
      status,
      verified_at: new Date().toISOString(),
      verified_by: (await supabase.auth.getUser()).data.user?.id,
    };

    if (status === 'rejected' && reason) {
      updateData.rejection_reason = reason;
    }

    const { data, error } = await supabase
      .from('expert_verifications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new Error(`전문가 상태 업데이트 실패: ${error.message}`);
    }

    return data;
  },

  // Get users with pagination and filtering
  async getUsers(page: number = 1, limit: number = 50, filter?: string) {
    await verifyAdminAccess();

    if (limit > 100) limit = 100; // Prevent excessive data retrieval

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filter) {
      query = query.or(`email.ilike.%${filter}%,name.ilike.%${filter}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`사용자 목록 조회 실패: ${error.message}`);
    }

    return { users: data || [], total: count || 0 };
  },

  // Get expert applications with server-side filtering
  async getExpertApplications(status?: string) {
    await verifyAdminAccess();

    let query = supabase
      .from('expert_verifications')
      .select(`
        *,
        user:users!expert_verifications_user_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`전문가 신청 목록 조회 실패: ${error.message}`);
    }

    return data || [];
  },

  // Get payments with filtering and pagination
  async getPayments(page: number = 1, limit: number = 50, status?: string) {
    await verifyAdminAccess();

    if (limit > 100) limit = 100;

    let query = supabase
      .from('payments')
      .select(`
        *,
        user:users!payments_user_id_fkey(name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`결제 내역 조회 실패: ${error.message}`);
    }

    return { payments: data || [], total: count || 0 };
  },

  // Update payment status
  async updatePaymentStatus(paymentId: string, status: 'completed' | 'failed' | 'refunded') {
    await verifyAdminAccess();

    if (!paymentId || !['completed', 'failed', 'refunded'].includes(status)) {
      throw new ValidationError('올바르지 않은 요청입니다');
    }

    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(`결제 상태 업데이트 실패: ${error.message}`);
    }

    return data;
  },

  // Delete user (soft delete)
  async deleteUser(userId: string) {
    await verifyAdminAccess();

    if (!userId) {
      throw new ValidationError('사용자 ID가 필요합니다');
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('account_type, email')
      .eq('id', userId)
      .single();

    if (user?.account_type === 'admin' || ADMIN_EMAILS.includes(user?.email || '')) {
      throw new ValidationError('관리자 계정은 삭제할 수 없습니다');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        email: `deleted_${Date.now()}_${user?.email}` // Anonymize email
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 삭제 실패: ${error.message}`);
    }

    return data;
  },

  // Get audit logs
  async getAuditLogs(page: number = 1, limit: number = 50) {
    await verifyAdminAccess();

    if (limit > 100) limit = 100;

    const { data, error, count } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin:users!admin_audit_log_admin_id_fkey(name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error(`감사 로그 조회 실패: ${error.message}`);
    }

    return { logs: data || [], total: count || 0 };
  },

  // Secure search function
  async searchData(table: string, searchTerm: string, limit: number = 50) {
    await verifyAdminAccess();

    if (!['users', 'expert_verifications', 'payments'].includes(table)) {
      throw new ValidationError('올바르지 않은 테이블입니다');
    }

    if (limit > 100) limit = 100;

    const { data, error } = await supabase.rpc('secure_admin_search', {
      search_table: table,
      search_term: searchTerm,
      limit_count: limit
    });

    if (error) {
      throw new Error(`검색 실패: ${error.message}`);
    }

    return data || [];
  }
};

// Rate limiting helper
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number = 60 * 1000; // 1 minute
  private readonly maxRequests: number = 100;

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const adminRateLimiter = new RateLimiter();