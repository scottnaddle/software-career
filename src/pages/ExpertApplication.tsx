import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Award, 
  Clock, 
  FileText, 
  Star, 
  Building, 
  GraduationCap,
  Link as LinkIcon,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useExpert, SpecializationCategory } from '../hooks/useExpert';
import { useAuth } from '../hooks/useAuth';

const ExpertApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expertProfile, applyAsExpert, getSpecializationCategories, loading } = useExpert();
  
  const [formData, setFormData] = useState({
    expert_type: 'individual' as 'individual' | 'organization',
    specializations: [] as string[],
    experience_years: 0,
    education: '',
    certifications: [] as string[],
    company: '',
    position: '',
    bio: '',
    linkedin_url: '',
    website_url: '',
    hourly_rate: 0,
  });

  const [specializationCategories, setSpecializationCategories] = useState<SpecializationCategory[]>([]);
  const [currentCertification, setCurrentCertification] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 이미 전문가 신청을 했거나 승인된 경우 리다이렉트
    if (expertProfile) {
      navigate('/expert-dashboard');
      return;
    }

    // 특기 분야 목록 로드
    loadSpecializations();
  }, [expertProfile, navigate]);

  const loadSpecializations = async () => {
    try {
      const categories = await getSpecializationCategories();
      setSpecializationCategories(categories);
    } catch (error) {
      console.error('Failed to load specializations:', error);
    }
  };

  const handleSpecializationToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(category)
        ? prev.specializations.filter(s => s !== category)
        : [...prev.specializations, category]
    }));
  };

  const addCertification = () => {
    if (currentCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, currentCertification.trim()]
      }));
      setCurrentCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (formData.specializations.length === 0) {
      setError('최소 하나의 전문 분야를 선택해주세요.');
      return;
    }

    if (formData.experience_years < 1) {
      setError('최소 1년 이상의 경력이 필요합니다.');
      return;
    }

    if (!formData.bio.trim()) {
      setError('자기소개를 작성해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await applyAsExpert(formData);
      navigate('/expert-dashboard');
    } catch (error: any) {
      setError(error.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">전문가 신청</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              K-Xpert 플랫폼의 전문가가 되어 경력 검증에 참여하고 수익을 창출하세요.
              신뢰할 수 있는 전문가만이 플랫폼에 참여할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 혜택 안내 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">수익 창출</h3>
            <p className="text-gray-600 text-sm">
              검토당 5만원~20만원의 수수료를 받고 전문성을 활용하세요.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">유연한 시간</h3>
            <p className="text-gray-600 text-sm">
              본인의 시간에 맞춰 검토 요청을 수락하고 진행하세요.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">전문가 인정</h3>
            <p className="text-gray-600 text-sm">
              검증된 전문가로서 업계 내 인지도와 신뢰도를 높이세요.
            </p>
          </div>
        </div>

        {/* 신청 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                기본 정보
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전문가 유형
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="expert_type"
                        value="individual"
                        checked={formData.expert_type === 'individual'}
                        onChange={(e) => setFormData(prev => ({ ...prev, expert_type: e.target.value as 'individual' }))}
                        className="mr-3"
                      />
                      <span>개인</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="expert_type"
                        value="organization"
                        checked={formData.expert_type === 'organization'}
                        onChange={(e) => setFormData(prev => ({ ...prev, expert_type: e.target.value as 'organization' }))}
                        className="mr-3"
                      />
                      <span>기관/기업</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    경력 년수 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 회사/소속
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 삼성전자, 서울대학교"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    직책/직위
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 시니어 개발자, 교수"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간당 검토 비용 (원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 100000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    권장: 50,000원 ~ 200,000원
                  </p>
                </div>
              </div>
            </div>

            {/* 전문 분야 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                전문 분야 *
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specializationCategories.map((category) => (
                  <label
                    key={category.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.specializations.includes(category.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(category.name)}
                      onChange={() => handleSpecializationToggle(category.name)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 학력 및 자격증 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                학력 및 자격증
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최종 학력
                  </label>
                  <textarea
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="예: 서울대학교 컴퓨터공학과 석사 (2020)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자격증
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentCertification}
                      onChange={(e) => setCurrentCertification(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="자격증명을 입력하고 추가 버튼을 클릭하세요"
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      추가
                    </button>
                  </div>
                  
                  {formData.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 소개 및 링크 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                소개 및 링크
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자기소개 *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="전문 분야, 경력, 검토 철학 등을 포함하여 자세히 작성해주세요."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn 프로필
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      개인 웹사이트
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-medium">오류</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  * 필수 항목
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      신청 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      전문가 신청하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 신청 후 절차 안내 */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">신청 후 절차</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <h4 className="font-medium text-blue-900 mb-1">신청서 검토</h4>
              <p className="text-blue-700 text-sm">3-5 영업일 내 신청서 검토</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <h4 className="font-medium text-blue-900 mb-1">승인 통보</h4>
              <p className="text-blue-700 text-sm">이메일로 승인/반려 결과 통보</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <h4 className="font-medium text-blue-900 mb-1">검토 시작</h4>
              <p className="text-blue-700 text-sm">전문가 대시보드에서 검토 시작</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertApplication;