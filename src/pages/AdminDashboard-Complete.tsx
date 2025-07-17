import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Users, UserCheck, CreditCard, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Award, 
  FileText, DollarSign, Calendar, Star, MessageSquare, Download, RefreshCw
} from 'lucide-react';

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
  specialties: string[];
  rate: number;
  bio: string;
  portfolio_url: string;
  linkedin_url: string;
  experience_years: number;
  education: string;
  certifications: string[];
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  users: {
    name: string;
    email: string;
    company: string;
    position: string;
    phone: string;
  };
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: string;
  type: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
  users: {
    name: string;
    email: string;
  };
}

interface ReviewRequest {
  id: string;
  user_id: string;
  expert_id: string;
  title: string;
  description: string;
  skills_required: string[];
  budget: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  deadline: string;
  created_at: string;
  client: {
    name: string;
    email: string;
  };
  expert?: {
    name: string;
    email: string;
  };
}

interface AllUser {
  id: string;
  email: string;
  name: string;
  account_type: string;
  company?: string;
  position?: string;
  phone?: string;
  created_at: string;
  verified: boolean;
  last_sign_in_at?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  
  // State for dashboard data
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
  const [allExperts, setAllExperts] = useState<ExpertApplication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'experts' | 'payments' | 'reviews' | 'users'>('overview');
  const [expertTab, setExpertTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpert, setSelectedExpert] = useState<ExpertApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  // Check if user is admin
  const adminEmails = ['admin@k-xpert.co.kr', 'admin@x-pert.co.kr'];
  const isAdmin = profile?.account_type === 'admin' || (user?.email && adminEmails.includes(user.email));

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive stats
      const [
        usersResult,
        expertsResult,
        paymentsResult,
        reviewsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('expert_verifications').select('status'),
        supabase.from('payments').select('amount, status, created_at'),
        supabase.from('review_requests').select('status')
      ]);

      const totalUsers = usersResult.count || 0;
      const expertStatuses = expertsResult.data || [];
      const paymentsData = paymentsResult.data || [];
      const reviewsData = reviewsResult.data || [];

      const pendingExperts = expertStatuses.filter(e => e.status === 'pending').length;
      const approvedExperts = expertStatuses.filter(e => e.status === 'verified').length;
      const rejectedExperts = expertStatuses.filter(e => e.status === 'rejected').length;

      const totalPayments = paymentsData.filter(p => p.status === 'completed').length;
      const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = paymentsData
        .filter(p => {
          const paymentDate = new Date(p.created_at);
          return p.status === 'completed' && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const activeReviews = reviewsData.filter(r => r.status === 'in_progress').length;

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

      // Fetch detailed data
      await Promise.all([
        fetchExpertApplications(),
        fetchPayments(),
        fetchReviewRequests(),
        fetchAllUsers()
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpertApplications = async () => {
    try {
      const { data: applications, error } = await supabase
        .from('expert_verifications')
        .select(`
          *,
          users!inner(name, email, company, position, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expert applications:', error);
        return;
      }

      setAllExperts(applications || []);
      
      // Set filtered applications based on current tab
      const pending = applications?.filter(app => app.status === 'pending') || [];
      setExpertApplications(pending);
    } catch (error) {
      console.error('Error in fetchExpertApplications:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          *,
          users!inner(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Error in fetchPayments:', error);
    }
  };

  const fetchReviewRequests = async () => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('review_requests')
        .select(`
          *,
          client:users!review_requests_user_id_fkey(name, email),
          expert:users!review_requests_expert_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching review requests:', error);
        return;
      }

      setReviewRequests(reviewsData || []);
    } catch (error) {
      console.error('Error in fetchReviewRequests:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setAllUsers(usersData || []);
    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
    }
  };

  const handleExpertAction = async (applicationId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const newStatus = action === 'approve' ? 'verified' : 'rejected';
      
      const updateData: any = {
        status: newStatus,
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      };

      if (action === 'reject' && reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('expert_verifications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      // If approved, update user table to mark as expert
      if (action === 'approve') {
        const application = allExperts.find(app => app.id === applicationId);
        if (application) {
          await supabase
            .from('users')
            .update({
              account_type: 'expert',
              verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', application.user_id);
        }
      }

      // Create notification for user
      const application = allExperts.find(app => app.id === applicationId);
      if (application) {
        await supabase
          .from('notifications')
          .insert({
            user_id: application.user_id,
            title: action === 'approve' ? '전문가 신청 승인' : '전문가 신청 거절',
            message: action === 'approve' 
              ? '축하합니다! 전문가 신청이 승인되었습니다.' 
              : `전문가 신청이 거절되었습니다. ${reason ? `사유: ${reason}` : ''}`,
            type: 'expert_application',
            priority: 'high',
            data: { application_id: applicationId, action, reason }
          });
      }

      await fetchDashboardData();
      
      // Reset modal state
      setShowRejectionModal(false);
      setRejectionReason('');
      setPendingActionId(null);
      
    } catch (error) {
      console.error('Error updating expert application:', error);
    }
  };

  const handleExpertTabChange = (tab: 'pending' | 'approved' | 'rejected' | 'all') => {
    setExpertTab(tab);
    setCurrentPage(1);
    
    let filteredExperts: ExpertApplication[] = [];
    
    switch (tab) {
      case 'pending':
        filteredExperts = allExperts.filter(expert => expert.status === 'pending');
        break;
      case 'approved':
        filteredExperts = allExperts.filter(expert => expert.status === 'verified');
        break;
      case 'rejected':
        filteredExperts = allExperts.filter(expert => expert.status === 'rejected');
        break;
      case 'all':
      default:
        filteredExperts = allExperts;
        break;
    }
    
    setExpertApplications(filteredExperts);
  };

  const handlePaymentStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      await fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleUserAction = async (userId: string, action: 'toggle_verification' | 'change_type' | 'delete', value?: string) => {
    try {
      if (action === 'toggle_verification') {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
          const { error } = await supabase
            .from('users')
            .update({ 
              verified: !user.verified,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          if (error) throw error;
        }
      } else if (action === 'change_type' && value) {
        const { error } = await supabase
          .from('users')
          .update({ 
            account_type: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        if (error) throw error;
      } else if (action === 'delete') {
        if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);
          if (error) throw error;
        }
      }

      await fetchAllUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getStatusBadge = (status: string, type: 'expert' | 'payment' | 'review' | 'user') => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (type === 'expert') {
      switch (status) {
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'verified':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'rejected':
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else if (type === 'payment') {
      switch (status) {
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'failed':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'cancelled':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        case 'refunded':
          return `${baseClasses} bg-orange-100 text-orange-800`;
        default:
          return `${baseClasses} bg-blue-100 text-blue-800`;
      }
    } else if (type === 'review') {
      switch (status) {
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'in_progress':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'assigned':
          return `${baseClasses} bg-purple-100 text-purple-800`;
        case 'cancelled':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-blue-100 text-blue-800`;
      }
    } else {
      // user type
      switch (status) {
        case 'verified':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'unverified':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600 mt-2">K-Xpert 플랫폼 관리</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>새로고침</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: '개요', icon: BarChart3 },
              { id: 'experts', name: '전문가 관리', icon: Award },
              { id: 'payments', name: '결제 관리', icon: CreditCard },
              { id: 'reviews', name: '리뷰 관리', icon: MessageSquare },
              { id: 'users', name: '사용자 관리', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">총 사용자</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">대기 중인 전문가</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingExperts}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">이번 달 매출</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ₩{stats.monthlyRevenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">활성 리뷰</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeReviews}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">전문가 현황</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">승인 대기</span>
                    <span className="text-sm font-medium text-yellow-600">{stats.pendingExperts}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">승인 완료</span>
                    <span className="text-sm font-medium text-green-600">{stats.approvedExperts}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">거절</span>
                    <span className="text-sm font-medium text-red-600">{stats.rejectedExperts}명</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">결제 현황</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">완료된 결제</span>
                    <span className="text-sm font-medium text-green-600">{stats.totalPayments}건</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">대기 중인 결제</span>
                    <span className="text-sm font-medium text-yellow-600">{stats.pendingPayments}건</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">이번 달 매출</span>
                    <span className="text-sm font-medium text-blue-600">
                      ₩{stats.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experts Tab */}
        {activeTab === 'experts' && (
          <div className="space-y-6">
            {/* Expert Sub-tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'pending', name: '승인 대기', count: stats.pendingExperts },
                  { id: 'approved', name: '승인 완료', count: stats.approvedExperts },
                  { id: 'rejected', name: '거절', count: stats.rejectedExperts },
                  { id: 'all', name: '전체', count: stats.pendingExperts + stats.approvedExperts + stats.rejectedExperts }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleExpertTabChange(tab.id as any)}
                    className={`${
                      expertTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.name} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            {/* Expert Applications List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {expertTab === 'pending' && '승인 대기 중인 전문가'}
                    {expertTab === 'approved' && '승인된 전문가'}
                    {expertTab === 'rejected' && '거절된 전문가 신청'}
                    {expertTab === 'all' && '전체 전문가 신청'}
                  </h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="전문가 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {expertApplications
                  .filter(expert => 
                    expert.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    expert.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    expert.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((expert) => (
                    <div key={expert.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-medium text-gray-900">{expert.users.name}</h4>
                            <span className={getStatusBadge(expert.status, 'expert')}>
                              {expert.status === 'pending' && '대기'}
                              {expert.status === 'verified' && '승인'}
                              {expert.status === 'rejected' && '거절'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <p><span className="font-medium">이메일:</span> {expert.users.email}</p>
                              <p><span className="font-medium">전화:</span> {expert.users.phone}</p>
                              <p><span className="font-medium">회사:</span> {expert.users.company}</p>
                              <p><span className="font-medium">직책:</span> {expert.users.position}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">시간당 요금:</span> ₩{expert.rate.toLocaleString()}</p>
                              <p><span className="font-medium">경력:</span> {expert.experience_years}년</p>
                              <p><span className="font-medium">학력:</span> {expert.education}</p>
                              <p><span className="font-medium">신청일:</span> {new Date(expert.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="font-medium text-gray-900 mb-2">전문 분야:</p>
                            <div className="flex flex-wrap gap-2">
                              {expert.specialties.map((specialty, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>

                          {expert.certifications.length > 0 && (
                            <div className="mb-4">
                              <p className="font-medium text-gray-900 mb-2">자격증:</p>
                              <div className="flex flex-wrap gap-2">
                                {expert.certifications.map((cert, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                  >
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mb-4">
                            <p className="font-medium text-gray-900 mb-2">자기소개:</p>
                            <p className="text-gray-700 text-sm">{expert.bio}</p>
                          </div>

                          <div className="flex space-x-4 text-sm">
                            {expert.portfolio_url && (
                              <a
                                href={expert.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>포트폴리오</span>
                              </a>
                            )}
                            {expert.linkedin_url && (
                              <a
                                href={expert.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>LinkedIn</span>
                              </a>
                            )}
                          </div>

                          {expert.status === 'rejected' && expert.rejection_reason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                <span className="font-medium">거절 사유:</span> {expert.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>

                        {expert.status === 'pending' && (
                          <div className="ml-6 flex flex-col space-y-2">
                            <button
                              onClick={() => handleExpertAction(expert.id, 'approve')}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => {
                                setPendingActionId(expert.id);
                                setShowRejectionModal(true);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              거절
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {expertApplications.length > itemsPerPage && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    총 {expertApplications.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, expertApplications.length)}개 표시
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(expertApplications.length / itemsPerPage)))}
                      disabled={currentPage >= Math.ceil(expertApplications.length / itemsPerPage)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">결제 관리</h3>
                  <div className="flex space-x-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">모든 상태</option>
                      <option value="pending">대기 중</option>
                      <option value="completed">완료</option>
                      <option value="failed">실패</option>
                      <option value="cancelled">취소</option>
                      <option value="refunded">환불</option>
                    </select>
                  </div>
                </div>
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
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제 방법
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments
                      .filter(payment => filterStatus === 'all' || payment.status === filterStatus)
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.users.name}</div>
                              <div className="text-sm text-gray-500">{payment.users.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₩{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(payment.status, 'payment')}>
                              {payment.status === 'pending' && '대기'}
                              {payment.status === 'completed' && '완료'}
                              {payment.status === 'failed' && '실패'}
                              {payment.status === 'cancelled' && '취소'}
                              {payment.status === 'refunded' && '환불'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {payment.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePaymentStatusChange(payment.id, 'completed')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handlePaymentStatusChange(payment.id, 'failed')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  거절
                                </button>
                              </div>
                            )}
                            {payment.status === 'completed' && (
                              <button
                                onClick={() => handlePaymentStatusChange(payment.id, 'refunded')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                환불
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">리뷰 요청 관리</h3>
              </div>

              <div className="divide-y divide-gray-200">
                {reviewRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((review) => (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium text-gray-900">{review.title}</h4>
                          <span className={getStatusBadge(review.status, 'review')}>
                            {review.status === 'pending' && '대기'}
                            {review.status === 'assigned' && '배정'}
                            {review.status === 'in_progress' && '진행중'}
                            {review.status === 'completed' && '완료'}
                            {review.status === 'cancelled' && '취소'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p><span className="font-medium">클라이언트:</span> {review.client.name}</p>
                            <p><span className="font-medium">이메일:</span> {review.client.email}</p>
                            <p><span className="font-medium">예산:</span> ₩{review.budget.toLocaleString()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">전문가:</span> {review.expert?.name || '미배정'}</p>
                            <p><span className="font-medium">마감일:</span> {new Date(review.deadline).toLocaleDateString()}</p>
                            <p><span className="font-medium">생성일:</span> {new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="font-medium text-gray-900 mb-2">필요 기술:</p>
                          <div className="flex flex-wrap gap-2">
                            {review.skills_required.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="font-medium text-gray-900 mb-2">설명:</p>
                          <p className="text-gray-700 text-sm">{review.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">사용자 관리</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="사용자 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        계정 유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        인증 상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.company && (
                                <div className="text-sm text-gray-500">{user.company}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.account_type}
                              onChange={(e) => handleUserAction(user.id, 'change_type', e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="individual">개인</option>
                              <option value="enterprise">기업</option>
                              <option value="expert">전문가</option>
                              <option value="admin">관리자</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(user.verified ? 'verified' : 'unverified', 'user')}>
                              {user.verified ? '인증됨' : '미인증'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUserAction(user.id, 'toggle_verification')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {user.verified ? '인증 해제' : '인증'}
                              </button>
                              {user.account_type !== 'admin' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'delete')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">전문가 신청 거절</h3>
                <p className="text-sm text-gray-600 mb-4">
                  거절 사유를 입력해주세요. 신청자에게 전달됩니다.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="거절 사유를 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  rows={4}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowRejectionModal(false);
                      setRejectionReason('');
                      setPendingActionId(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (pendingActionId) {
                        handleExpertAction(pendingActionId, 'reject', rejectionReason);
                      }
                    }}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;