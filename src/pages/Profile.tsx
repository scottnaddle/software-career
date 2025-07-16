import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  Star,
  Award,
  FileText,
  Settings,
  Camera,
  Upload,
  Trash2,
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
  Plus,
  Minus,
  ExternalLink,
  BarChart3,
  Trophy,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const {
    statistics,
    loading,
    saving,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    requestExpertVerification,
    changePassword,
    deleteAccount,
    getProfileCompletionPercentage,
    setError
  } = useUserProfile();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'expert' | 'stats'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    position: profile?.position || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    education: profile?.education || '',
    experience_years: profile?.experience_years || 0,
    industry: profile?.industry || '',
    linkedin_url: profile?.linkedin_url || '',
    github_url: profile?.github_url || '',
    portfolio_url: profile?.portfolio_url || '',
    location: profile?.location || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deletePasswordData, setDeletePasswordData] = useState({
    password: '',
    confirmText: ''
  });

  const [expertData, setExpertData] = useState({
    specialties: profile?.expert_specialties || [],
    rate: profile?.expert_rate || 0,
    bio: profile?.expert_bio || '',
    portfolio_url: profile?.portfolio_url || '',
    linkedin_url: profile?.linkedin_url || ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // Update form data when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        education: profile.education || '',
        experience_years: profile.experience_years || 0,
        industry: profile.industry || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setEditMode(false);
      setError(null);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deletePasswordData.confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    const result = await deleteAccount(deletePasswordData.password);
    if (result.success) {
      await signOut();
    }
  };

  const handleExpertRequest = async () => {
    if (!expertData.specialties.length || !expertData.rate || !expertData.bio) {
      setError('Please fill in all required fields');
      return;
    }

    const result = await requestExpertVerification(expertData);
    if (result.success) {
      setShowExpertModal(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !expertData.specialties.includes(newSpecialty.trim())) {
      setExpertData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    setExpertData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(specialty => specialty !== specialtyToRemove)
    }));
  };

  const completionPercentage = getProfileCompletionPercentage();

  const getExpertStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
              <p className="text-gray-600 mt-2">프로필 정보를 관리하고 설정을 변경하세요</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">프로필 완성도</div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
                </div>
              </div>
              <Link
                to="/career-search"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                대시보드로 이동
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-3">{profile?.name}</h3>
                <p className="text-sm text-gray-600">{profile?.position}</p>
                <p className="text-sm text-gray-500">{profile?.company}</p>
                
                {profile?.is_expert && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpertStatusColor(profile.expert_verification_status || 'pending')}`}>
                      <Award className="h-3 w-3 mr-1" />
                      {profile.expert_verification_status === 'verified' ? '인증 전문가' :
                       profile.expert_verification_status === 'pending' ? '인증 대기' : '인증 거절'}
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 mr-3" />
                  프로필 정보
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'stats'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  통계
                </button>
                <button
                  onClick={() => setActiveTab('expert')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'expert'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Award className="h-4 w-4 mr-3" />
                  전문가 설정
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  보안 설정
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">프로필 정보</h2>
                  <button
                    onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        저장 중...
                      </>
                    ) : editMode ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        편집
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.name || '설정되지 않음'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <p className="text-gray-900">{profile?.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.phone || '설정되지 않음'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">회사</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.company || '설정되지 않음'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.position || '설정되지 않음'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.location || '설정되지 않음'}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">산업 분야</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.industry}
                          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.industry || '설정되지 않음'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">경력 연수</label>
                      {editMode ? (
                        <input
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.experience_years || 0}년</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">학력</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.education || '설정되지 않음'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      {editMode ? (
                        <input
                          type="url"
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profile?.linkedin_url ? (
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                              LinkedIn 프로필 <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            '설정되지 않음'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                      {editMode ? (
                        <input
                          type="url"
                          value={formData.github_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profile?.github_url ? (
                            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                              GitHub 프로필 <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            '설정되지 않음'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">포트폴리오</label>
                      {editMode ? (
                        <input
                          type="url"
                          value={formData.portfolio_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profile?.portfolio_url ? (
                            <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                              포트폴리오 보기 <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            '설정되지 않음'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                  {editMode ? (
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="자기소개를 입력하세요..."
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">{profile?.bio || '설정되지 않음'}</p>
                  )}
                </div>

                {/* Skills */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        {editMode && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editMode && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="새 기술 스택 추가"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={addSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">통계</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics?.totalCareers || 0}</div>
                      <div className="text-sm text-gray-600">총 경력</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics?.verifiedCareers || 0}</div>
                      <div className="text-sm text-gray-600">인증된 경력</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics?.pendingCareers || 0}</div>
                      <div className="text-sm text-gray-600">대기 중인 경력</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics?.rejectedCareers || 0}</div>
                      <div className="text-sm text-gray-600">거부된 경력</div>
                    </div>
                  </div>
                </div>

                {profile?.is_expert && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">전문가 활동 통계</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                          <Award className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{statistics?.completedReviews || 0}</div>
                        <div className="text-sm text-gray-600">완료된 검토</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                          <Star className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{statistics?.averageRating?.toFixed(1) || '0.0'}</div>
                        <div className="text-sm text-gray-600">평균 평점</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{statistics?.pendingReviews || 0}</div>
                        <div className="text-sm text-gray-600">대기 중인 검토</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expert Tab */}
            {activeTab === 'expert' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">전문가 설정</h2>
                  {!profile?.is_expert && (
                    <button
                      onClick={() => setShowExpertModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      전문가 신청
                    </button>
                  )}
                </div>

                {profile?.is_expert ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">전문가 상태</h3>
                          <p className="text-sm text-gray-600">
                            {profile.expert_verification_status === 'verified' ? '인증된 전문가입니다' :
                             profile.expert_verification_status === 'pending' ? '인증 검토 중입니다' :
                             '인증이 거부되었습니다'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExpertStatusColor(profile.expert_verification_status || 'pending')}`}>
                        {profile.expert_verification_status === 'verified' ? '인증됨' :
                         profile.expert_verification_status === 'pending' ? '대기 중' : '거부됨'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">전문 분야</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.expert_specialties?.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">시간당 요율</h4>
                        <p className="text-lg font-semibold text-green-600">
                          {profile.expert_rate?.toLocaleString()}원/시간
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">전문가 소개</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{profile.expert_bio}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">전문가가 되어보세요</h3>
                    <p className="text-gray-600 mb-4">
                      경력 검토 전문가로 활동하여 다른 사용자들의 경력을 검토하고 수익을 창출하세요.
                    </p>
                    <button
                      onClick={() => setShowExpertModal(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      전문가 신청하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">보안 설정</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Lock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">비밀번호 변경</h3>
                          <p className="text-sm text-gray-600">계정 보안을 위해 주기적으로 비밀번호를 변경하세요</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        변경
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <h3 className="font-medium text-red-900">계정 삭제</h3>
                          <p className="text-sm text-red-700">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {saving ? '변경 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">계정 삭제</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                    <input
                      type="password"
                      value={deletePasswordData.password}
                      onChange={(e) => setDeletePasswordData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      확인을 위해 "DELETE"를 입력하세요
                    </label>
                    <input
                      type="text"
                      value={deletePasswordData.confirmText}
                      onChange={(e) => setDeletePasswordData(prev => ({ ...prev, confirmText: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                >
                  {saving ? '삭제 중...' : '계정 삭제'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expert Application Modal */}
        {showExpertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">전문가 신청</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전문 분야</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {expertData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {specialty}
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      placeholder="전문 분야 추가"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addSpecialty}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시간당 요율 (원)</label>
                  <input
                    type="number"
                    value={expertData.rate}
                    onChange={(e) => setExpertData(prev => ({ ...prev, rate: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전문가 소개</label>
                  <textarea
                    rows={4}
                    value={expertData.bio}
                    onChange={(e) => setExpertData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="전문가로서의 경험과 역량을 소개해주세요..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">포트폴리오 URL (선택)</label>
                  <input
                    type="url"
                    value={expertData.portfolio_url}
                    onChange={(e) => setExpertData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL (선택)</label>
                  <input
                    type="url"
                    value={expertData.linkedin_url}
                    onChange={(e) => setExpertData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleExpertRequest}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {saving ? '신청 중...' : '신청'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;