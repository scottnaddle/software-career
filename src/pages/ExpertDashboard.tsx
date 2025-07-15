import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  DollarSign, 
  FileText, 
  Star, 
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Building,
  Loader2
} from 'lucide-react';
import { useExpert } from '../hooks/useExpert';
import { useReview } from '../hooks/useReview';
import { useAuth } from '../hooks/useAuth';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const { expertProfile, loading: expertLoading } = useExpert();
  const { 
    getExpertReviewRequests, 
    getUnassignedReviewRequests,
    acceptReviewRequest,
    updateReviewRequestStatus,
    loading: reviewLoading 
  } = useReview();

  const [activeTab, setActiveTab] = useState<'overview' | 'assigned' | 'available' | 'completed'>('overview');
  const [assignedRequests, setAssignedRequests] = useState<any[]>([]);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [completedRequests, setCompletedRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    completedReviews: 0,
    pendingReviews: 0,
    totalEarnings: 0,
    averageRating: 0,
    thisMonthReviews: 0
  });

  useEffect(() => {
    if (expertProfile && expertProfile.status === 'approved') {
      loadDashboardData();
    }
  }, [expertProfile]);

  const loadDashboardData = async () => {
    try {
      // 배정된 검토 요청 로드
      const assigned = await getExpertReviewRequests();
      setAssignedRequests(assigned.filter((req: any) => ['assigned', 'in_progress'].includes(req.status)));
      
      const completed = assigned.filter((req: any) => req.status === 'completed');
      setCompletedRequests(completed);

      // 미배정 검토 요청 로드
      const available = await getUnassignedReviewRequests(expertProfile?.specializations);
      setAvailableRequests(available);

      // 통계 계산
      calculateStats(assigned);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateStats = (allRequests: any[]) => {
    const completed = allRequests.filter((req: any) => req.status === 'completed');
    const pending = allRequests.filter((req: any) => ['assigned', 'in_progress'].includes(req.status));
    
    const totalEarnings = completed.reduce((sum: number, req: any) => sum + (req.review_fee || 0), 0);
    
    const thisMonth = new Date();
    const thisMonthCompleted = completed.filter((req: any) => {
      const completedDate = new Date(req.completed_at);
      return completedDate.getMonth() === thisMonth.getMonth() && 
             completedDate.getFullYear() === thisMonth.getFullYear();
    });

    setStats({
      totalReviews: allRequests.length,
      completedReviews: completed.length,
      pendingReviews: pending.length,
      totalEarnings,
      averageRating: expertProfile?.rating || 0,
      thisMonthReviews: thisMonthCompleted.length
    });
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptReviewRequest(requestId);
      await loadDashboardData(); // 데이터 새로고침
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('요청 수락 중 오류가 발생했습니다.');
    }
  };

  const handleStartReview = async (requestId: string) => {
    try {
      await updateReviewRequestStatus(requestId, 'in_progress');
      await loadDashboardData();
    } catch (error) {
      console.error('Error starting review:', error);
      alert('검토 시작 중 오류가 발생했습니다.');
    }
  };

  if (expertLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!expertProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">전문가 프로필이 없습니다</h2>
          <p className="text-gray-600 mb-4">먼저 전문가 신청을 해주세요.</p>
          <a
            href="/expert-application"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            전문가 신청하기
          </a>
        </div>
      </div>
    );
  }

  if (expertProfile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">승인 대기 중</h2>
          <p className="text-gray-600 mb-4">
            전문가 신청이 검토 중입니다. 3-5 영업일 내에 결과를 알려드립니다.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-yellow-800">
              <strong>신청 상태:</strong> {
                expertProfile.status === 'pending' ? '검토 중' :
                expertProfile.status === 'rejected' ? '반려됨' : '일시정지'
              }
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              신청일: {new Date(expertProfile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 검토 수</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">완료된 검토</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedReviews}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 수익</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEarnings.toLocaleString()}원</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
            <Star className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 전문가 프로필 요약 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">전문가 프로필</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{expertProfile.company || '전문가'}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    승인됨
                  </span>
                </div>
                <p className="text-gray-600">{expertProfile.position}</p>
                <p className="text-sm text-gray-500 mt-1">
                  경력 {expertProfile.experience_years}년 • {expertProfile.total_reviews}개 리뷰
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">전문 분야</h4>
            <div className="flex flex-wrap gap-2">
              {expertProfile.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
        {assignedRequests.length > 0 ? (
          <div className="space-y-4">
            {assignedRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{request.careers?.title}</h4>
                    <p className="text-sm text-gray-600">
                      {request.careers?.company} • {request.users?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      요청일: {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'assigned' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status === 'assigned' ? '배정됨' : '진행 중'}
                    </span>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {request.review_fee?.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">배정된 검토가 없습니다.</p>
        )}
      </div>
    </div>
  );

  const renderAssignedRequests = () => (
    <div className="space-y-6">
      {assignedRequests.length > 0 ? (
        assignedRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.careers?.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'assigned' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {request.status === 'assigned' ? '배정됨' : '진행 중'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청자</p>
                    <p className="font-medium">{request.users?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">회사</p>
                    <p className="font-medium">{request.careers?.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청일</p>
                    <p className="font-medium">{new Date(request.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">검토 비용</p>
                    <p className="font-medium text-green-600">{request.review_fee?.toLocaleString()}원</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">경력 설명</p>
                  <p className="text-gray-800">{request.careers?.description}</p>
                </div>

                {request.careers?.technologies && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">기술 스택</p>
                    <div className="flex flex-wrap gap-2">
                      {request.careers.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                {request.status === 'assigned' && (
                  <button
                    onClick={() => handleStartReview(request.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    검토 시작
                  </button>
                )}
                {request.status === 'in_progress' && (
                  <button
                    onClick={() => window.location.href = `/expert/review/${request.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    검토 진행
                  </button>
                )}
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  상세 보기
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">배정된 검토가 없습니다</h3>
          <p className="text-gray-600">새로운 검토 요청이 배정되면 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );

  const renderAvailableRequests = () => (
    <div className="space-y-6">
      {availableRequests.length > 0 ? (
        availableRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.careers?.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.priority === 'urgent' ? '긴급' :
                     request.priority === 'high' ? '높음' :
                     request.priority === 'low' ? '낮음' : '보통'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">회사</p>
                    <p className="font-medium">{request.careers?.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청일</p>
                    <p className="font-medium">{new Date(request.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">예상 수익</p>
                    <p className="font-medium text-green-600">{request.review_fee?.toLocaleString()}원</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">경력 설명</p>
                  <p className="text-gray-800 line-clamp-2">{request.careers?.description}</p>
                </div>

                {request.careers?.technologies && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">기술 스택</p>
                    <div className="flex flex-wrap gap-2">
                      {request.careers.technologies.slice(0, 5).map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                      {request.careers.technologies.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          +{request.careers.technologies.length - 5}개 더
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={reviewLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
                >
                  {reviewLoading ? '처리 중...' : '수락하기'}
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  상세 보기
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">사용 가능한 검토가 없습니다</h3>
          <p className="text-gray-600">새로운 검토 요청이 등록되면 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );

  const renderCompletedRequests = () => (
    <div className="space-y-6">
      {completedRequests.length > 0 ? (
        completedRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.careers?.title}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    완료됨
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">회사</p>
                    <p className="font-medium">{request.careers?.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">완료일</p>
                    <p className="font-medium">{new Date(request.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">수익</p>
                    <p className="font-medium text-green-600">{request.review_fee?.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
              
              <div className="ml-6">
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  검토 결과 보기
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">완료된 검토가 없습니다</h3>
          <p className="text-gray-600">검토를 완료하면 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 대시보드</h1>
              <p className="text-gray-600">
                안녕하세요, {expertProfile.company || '전문가'}님! 검토 요청을 관리하고 수익을 확인하세요.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{stats.thisMonthReviews}</div>
              <div className="text-sm text-gray-500">이번 달 검토</div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { key: 'overview', label: '개요', icon: TrendingUp },
                { key: 'assigned', label: `배정됨 (${assignedRequests.length})`, icon: Clock },
                { key: 'available', label: `사용가능 (${availableRequests.length})`, icon: FileText },
                { key: 'completed', label: `완료됨 (${completedRequests.length})`, icon: CheckCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'assigned' && renderAssignedRequests()}
            {activeTab === 'available' && renderAvailableRequests()}
            {activeTab === 'completed' && renderCompletedRequests()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;