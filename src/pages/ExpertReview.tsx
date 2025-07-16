import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Star,
  MessageSquare,
  Clock,
  User,
  Download,
  Eye,
  Save,
  Send,
  Loader2,
  Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useReview } from '../hooks/useReview';
import { supabase } from '../lib/supabase';

interface ReviewData {
  id: string;
  career_id: string;
  user_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  review_fee: number;
  requested_at: string;
  started_at?: string;
  completed_at?: string;
  review_result?: 'approved' | 'rejected' | 'needs_clarification';
  review_notes?: string;
  review_score?: number;
  careers?: {
    id: string;
    title: string;
    company: string;
    role: string;
    description: string;
    start_date: string;
    end_date?: string;
    type: 'experience' | 'education' | 'project' | 'certificate';
    technologies: string[];
    achievements: string[];
    status: 'draft' | 'pending' | 'verified' | 'rejected';
  };
  users?: {
    id: string;
    name: string;
    email: string;
    company?: string;
    position?: string;
  };
}

const ExpertReview: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateReviewRequestStatus } = useReview();
  
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 검토 폼 상태
  const [reviewForm, setReviewForm] = useState({
    result: '' as 'approved' | 'rejected' | 'needs_clarification' | '',
    score: 0,
    notes: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[]
  });
  
  // 새로운 코멘트 추가
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');

  useEffect(() => {
    if (reviewId) {
      fetchReviewData();
    }
  }, [reviewId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_requests')
        .select(`
          *,
          careers!inner(*),
          users!inner(id, name, email, company, position)
        `)
        .eq('id', reviewId)
        .single();

      if (error) throw error;
      setReviewData(data);
      
      // 기존 검토 내용이 있으면 폼에 로드
      if (data.review_result) {
        setReviewForm({
          result: data.review_result,
          score: data.review_score || 0,
          notes: data.review_notes || '',
          strengths: data.review_strengths || [],
          weaknesses: data.review_weaknesses || [],
          recommendations: data.review_recommendations || []
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = async () => {
    if (!reviewData) return;
    
    try {
      await updateReviewRequestStatus(reviewData.id, 'in_progress');
      setReviewData(prev => prev ? { ...prev, status: 'in_progress' } : null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData || !reviewForm.result || !reviewForm.notes) {
      alert('검토 결과와 상세 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('review_requests')
        .update({
          status: 'completed',
          review_result: reviewForm.result,
          review_score: reviewForm.score,
          review_notes: reviewForm.notes,
          review_strengths: reviewForm.strengths,
          review_weaknesses: reviewForm.weaknesses,
          review_recommendations: reviewForm.recommendations,
          completed_at: new Date().toISOString()
        })
        .eq('id', reviewData.id);

      if (error) throw error;

      // 경력 상태 업데이트
      const careerStatus = reviewForm.result === 'approved' ? 'verified' : 'rejected';
      await supabase
        .from('careers')
        .update({ 
          status: careerStatus,
          verification_date: new Date().toISOString(),
          verification_notes: reviewForm.notes
        })
        .eq('id', reviewData.career_id);

      alert('검토가 완료되었습니다!');
      navigate('/expert-dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setReviewForm(prev => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()]
      }));
      setNewStrength('');
    }
  };

  const addWeakness = () => {
    if (newWeakness.trim()) {
      setReviewForm(prev => ({
        ...prev,
        weaknesses: [...prev.weaknesses, newWeakness.trim()]
      }));
      setNewWeakness('');
    }
  };

  const addRecommendation = () => {
    if (newRecommendation.trim()) {
      setReviewForm(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRecommendation.trim()]
      }));
      setNewRecommendation('');
    }
  };

  const removeItem = (type: 'strengths' | 'weaknesses' | 'recommendations', index: number) => {
    setReviewForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'experience':
        return <Building className="h-5 w-5 text-blue-600" />;
      case 'education':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'project':
        return <Star className="h-5 w-5 text-purple-600" />;
      case 'certificate':
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'experience':
        return 'bg-blue-100 text-blue-800';
      case 'education':
        return 'bg-green-100 text-green-800';
      case 'project':
        return 'bg-purple-100 text-purple-800';
      case 'certificate':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">검토 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">검토를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">{error || '검토 데이터를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/expert-dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/expert-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            대시보드로 돌아가기
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">경력 검토</h1>
              <p className="text-gray-600 mt-2">전문가로서 경력을 면밀히 검토하고 평가해주세요.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(reviewData.priority)}`}>
                {reviewData.priority === 'urgent' ? '긴급' :
                 reviewData.priority === 'high' ? '높음' :
                 reviewData.priority === 'low' ? '낮음' : '보통'}
              </span>
              <span className="text-lg font-semibold text-green-600">
                {reviewData.review_fee.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 경력 정보 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 경력 개요 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">경력 정보</h2>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(reviewData.careers?.type || '')}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(reviewData.careers?.type || '')}`}>
                    {reviewData.careers?.type === 'experience' ? '근무경력' :
                     reviewData.careers?.type === 'education' ? '학력' :
                     reviewData.careers?.type === 'project' ? '프로젝트' :
                     reviewData.careers?.type === 'certificate' ? '자격증' : '기타'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reviewData.careers?.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      <span>{reviewData.careers?.company}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{reviewData.careers?.role}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {reviewData.careers?.start_date} ~ {reviewData.careers?.end_date || '현재'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">요청자 정보</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>{reviewData.users?.name}</div>
                    <div>{reviewData.users?.email}</div>
                    {reviewData.users?.company && <div>{reviewData.users?.company}</div>}
                    {reviewData.users?.position && <div>{reviewData.users?.position}</div>}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">상세 설명</h4>
                <p className="text-gray-700 leading-relaxed">
                  {reviewData.careers?.description}
                </p>
              </div>

              {reviewData.careers?.technologies && reviewData.careers.technologies.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">기술 스택</h4>
                  <div className="flex flex-wrap gap-2">
                    {reviewData.careers.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {reviewData.careers?.achievements && reviewData.careers.achievements.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">주요 성과</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {reviewData.careers.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 검토 양식 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">검토 양식</h2>

              {/* 검토 결과 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  검토 결과 *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="result"
                      value="approved"
                      checked={reviewForm.result === 'approved'}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, result: e.target.value as any }))}
                      className="mr-3"
                    />
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700 font-medium">승인</span>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="result"
                      value="rejected"
                      checked={reviewForm.result === 'rejected'}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, result: e.target.value as any }))}
                      className="mr-3"
                    />
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 font-medium">거부</span>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="result"
                      value="needs_clarification"
                      checked={reviewForm.result === 'needs_clarification'}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, result: e.target.value as any }))}
                      className="mr-3"
                    />
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-orange-700 font-medium">보완 필요</span>
                  </label>
                </div>
              </div>

              {/* 평점 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  평점 (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewForm(prev => ({ ...prev, score: rating }))}
                      className={`p-2 rounded-lg transition-colors ${
                        reviewForm.score >= rating
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-6 w-6" fill={reviewForm.score >= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="ml-4 text-sm text-gray-600">
                    {reviewForm.score > 0 ? `${reviewForm.score}/5` : '평점을 선택해주세요'}
                  </span>
                </div>
              </div>

              {/* 상세 검토 내용 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  상세 검토 내용 *
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="검토 결과에 대한 상세한 설명을 작성해주세요..."
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              {/* 강점 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  강점 및 우수한 점
                </label>
                <div className="space-y-2 mb-3">
                  {reviewForm.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-green-800">{strength}</span>
                      <button
                        onClick={() => removeItem('strengths', index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="강점을 입력하세요"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStrength()}
                  />
                  <button
                    onClick={addStrength}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 약점 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  약점 및 개선점
                </label>
                <div className="space-y-2 mb-3">
                  {reviewForm.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                      <span className="text-red-800">{weakness}</span>
                      <button
                        onClick={() => removeItem('weaknesses', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="개선점을 입력하세요"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newWeakness}
                    onChange={(e) => setNewWeakness(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addWeakness()}
                  />
                  <button
                    onClick={addWeakness}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 권장사항 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  권장사항 및 조언
                </label>
                <div className="space-y-2 mb-3">
                  {reviewForm.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="text-blue-800">{recommendation}</span>
                      <button
                        onClick={() => removeItem('recommendations', index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="권장사항을 입력하세요"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newRecommendation}
                    onChange={(e) => setNewRecommendation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRecommendation()}
                  />
                  <button
                    onClick={addRecommendation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 검토 상태 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">검토 상태</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">현재 상태</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reviewData.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                    reviewData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {reviewData.status === 'assigned' ? '배정됨' :
                     reviewData.status === 'in_progress' ? '진행 중' :
                     '완료됨'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">요청일</span>
                  <span className="text-sm text-gray-900">
                    {new Date(reviewData.requested_at).toLocaleDateString()}
                  </span>
                </div>
                {reviewData.started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">시작일</span>
                    <span className="text-sm text-gray-900">
                      {new Date(reviewData.started_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {reviewData.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">완료일</span>
                    <span className="text-sm text-gray-900">
                      {new Date(reviewData.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">작업</h3>
              <div className="space-y-3">
                {reviewData.status === 'assigned' && (
                  <button
                    onClick={handleStartReview}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    검토 시작
                  </button>
                )}
                
                {reviewData.status === 'in_progress' && (
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || !reviewForm.result || !reviewForm.notes}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        검토 완료
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => setReviewForm(prev => ({ ...prev, notes: prev.notes }))}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  임시 저장
                </button>
              </div>
            </div>

            {/* 검토 가이드 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">검토 가이드</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">확인 사항</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>경력 기간의 타당성</li>
                    <li>업무 내용의 구체성</li>
                    <li>기술 스택의 적절성</li>
                    <li>성과의 측정 가능성</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">평가 기준</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>1점: 매우 부족</li>
                    <li>2점: 부족</li>
                    <li>3점: 보통</li>
                    <li>4점: 우수</li>
                    <li>5점: 매우 우수</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertReview;