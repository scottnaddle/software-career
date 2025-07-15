import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, CreditCard, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingExperts: number;
  approvedExperts: number;
  rejectedExperts: number;
  totalPayments: number;
  pendingPayments: number;
  monthlyRevenue: number;
  activeReviews: number;
}

interface ExpertApplication {
  id: string;
  user_id: string;
  specialization: string;
  experience_years: number;
  certifications: string[];
  portfolio_url: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    name: string;
    email: string;
    company: string;
    position: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingExperts: 0,
    approvedExperts: 0,
    rejectedExperts: 0,
    totalPayments: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    activeReviews: 0
  });
  const [expertApplications, setExpertApplications] = useState<ExpertApplication[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'experts' | 'payments' | 'users'>('overview');

  // Check if user is admin
  const isAdmin = profile?.account_type === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [
        usersResult,
        expertsResult,
        paymentsResult,
        reviewsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('expert_profiles').select('status'),
        supabase.from('payments').select('amount, status, created_at'),
        supabase.from('review_requests').select('status')
      ]);

      // Calculate stats
      const totalUsers = usersResult.count || 0;
      const experts = expertsResult.data || [];
      const payments = paymentsResult.data || [];
      const reviews = reviewsResult.data || [];

      const pendingExperts = experts.filter(e => e.status === 'pending').length;
      const approvedExperts = experts.filter(e => e.status === 'approved').length;
      const rejectedExperts = experts.filter(e => e.status === 'rejected').length;

      const completedPayments = payments.filter(p => p.status === 'completed');
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      const totalPayments = completedPayments.length;

      // Calculate monthly revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = completedPayments
        .filter(p => {
          const paymentDate = new Date(p.created_at);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const activeReviews = reviews.filter(r => r.status === 'in_progress').length;

      setStats({
        totalUsers,
        pendingExperts,
        approvedExperts,
        rejectedExperts,
        totalPayments,
        pendingPayments,
        monthlyRevenue,
        activeReviews
      });

      // Fetch expert applications
      const { data: applications, error: applicationsError } = await supabase
        .from('expert_profiles')
        .select(`
          *,
          users!inner(name, email, company, position)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.warn('Error fetching expert applications:', applicationsError);
      }
      setExpertApplications(applications || []);

      // Fetch recent payments
      const { data: recentPaymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          users!inner(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsError) {
        console.warn('Error fetching recent payments:', paymentsError);
      }
      setRecentPayments(recentPaymentsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpertApplication = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('expert_profiles')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating expert application:', error);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">K-Xpert 시스템 관리 및 모니터링</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: '개요', icon: BarChart3 },
                { id: 'experts', label: '전문가 관리', icon: UserCheck },
                { id: 'payments', label: '결제 관리', icon: CreditCard },
                { id: 'users', label: '사용자 관리', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">총 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">승인 대기 전문가</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingExperts}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">월간 매출</p>
                    <p className="text-2xl font-bold text-gray-900">₩{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">진행 중인 검토</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeReviews}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 결제 내역</h3>
                <div className="space-y-4">
                  {recentPayments.slice(0, 5).map(payment => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{payment.user.name}</p>
                        <p className="text-sm text-gray-500">{payment.user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₩{payment.amount.toLocaleString()}</p>
                        <p className={`text-sm ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'pending' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {payment.status === 'completed' ? '완료' :
                           payment.status === 'pending' ? '대기' : '실패'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">전문가 현황</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">승인된 전문가</span>
                    </div>
                    <span className="font-bold text-gray-900">{stats.approvedExperts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-700">승인 대기</span>
                    </div>
                    <span className="font-bold text-gray-900">{stats.pendingExperts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-gray-700">거절된 신청</span>
                    </div>
                    <span className="font-bold text-gray-900">{stats.rejectedExperts}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experts Tab */}
        {activeTab === 'experts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">전문가 승인 관리</h3>
              <p className="text-gray-600 mt-1">승인 대기 중인 전문가 신청서를 검토하고 승인/거절할 수 있습니다.</p>
            </div>
            <div className="p-6">
              {expertApplications.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">승인 대기 중인 전문가 신청이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {expertApplications.map(application => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{application.user.name}</h4>
                              <p className="text-gray-600">{application.user.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">회사: {application.user.company}</p>
                              <p className="text-sm text-gray-500">직책: {application.user.position}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">전문 분야</p>
                              <p className="text-gray-600">{application.specialization}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">경력</p>
                              <p className="text-gray-600">{application.experience_years}년</p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">지원 동기</p>
                            <p className="text-gray-600 text-sm">{application.motivation}</p>
                          </div>
                          {application.portfolio_url && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700">포트폴리오</p>
                              <a 
                                href={application.portfolio_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                {application.portfolio_url}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="ml-6 flex space-x-3">
                          <button
                            onClick={() => handleExpertApplication(application.id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleExpertApplication(application.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">결제 현황 모니터링</h3>
              <p className="text-gray-600 mt-1">시스템 내 모든 결제 내역을 확인할 수 있습니다.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제 방법
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments.map(payment => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.user.name}</div>
                          <div className="text-sm text-gray-500">{payment.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{payment.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.payment_method}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'completed' ? '완료' :
                           payment.status === 'pending' ? '대기' : '실패'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>
              <p className="text-gray-600 mt-1">시스템 사용자 정보를 관리할 수 있습니다.</p>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">사용자 관리 기능은 개발 중입니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;