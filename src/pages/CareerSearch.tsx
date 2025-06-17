import React, { useState } from 'react';
import { Search, Filter, Eye, Download, Shield, Calendar, MapPin, Code, Award, ExternalLink, GraduationCap, Briefcase, FileText, User, CheckCircle, Edit, Star, Globe, BookOpen, Users } from 'lucide-react';

const CareerSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // 전문가 프로필 정보
  const expertProfile = {
    name: '김글로벌',
    email: 'kim.global@example.com',
    phone: '010-1234-5678',
    position: '시니어 글로벌 비즈니스 매니저',
    company: '삼성전자',
    profileImage: null,
    koicaGrade: '특급',
    totalExperience: '8년 3개월',
    verifiedCareers: 12,
    badges: [
      {
        id: 1,
        name: 'KOICA 특급 전문가',
        type: 'koica',
        level: '특급',
        issueDate: '2023.03.15',
        color: 'bg-red-100 text-red-800 border-red-200'
      },
      {
        id: 2,
        name: 'ODA 기초교육 수료',
        type: 'oda_basic',
        issueDate: '2022.08.20',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      {
        id: 3,
        name: 'ODA 심화교육 수료',
        type: 'oda_advanced',
        issueDate: '2023.01.10',
        color: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      {
        id: 4,
        name: '글로벌 프로젝트 관리 인증',
        type: 'project_management',
        issueDate: '2023.06.05',
        color: 'bg-green-100 text-green-800 border-green-200'
      },
      {
        id: 5,
        name: '국제개발협력 전문가',
        type: 'development_cooperation',
        issueDate: '2022.11.30',
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    ],
    specializations: ['국제개발협력', '프로젝트 관리', '정책 컨설팅', '역량강화'],
    languages: ['한국어(모국어)', '영어(고급)', '스페인어(중급)']
  };

  const careers = [
    {
      id: 1,
      title: '전자상거래 플랫폼 개발',
      company: '네이버',
      period: '2023.03 - 2023.12',
      role: '백엔드 개발자',
      status: 'verified',
      type: 'project',
      technologies: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
      description: '대규모 전자상거래 플랫폼의 주문 처리 시스템 개발 및 성능 최적화',
      verificationDate: '2024.01.15',
      achievements: ['시스템 성능 30% 향상', '주문 처리량 2배 증가']
    },
    {
      id: 2,
      title: '컴퓨터공학과',
      company: '서울대학교',
      period: '2018.03 - 2022.02',
      role: '학사 졸업',
      status: 'verified',
      type: 'education',
      technologies: [],
      description: '컴퓨터공학 전공, 학점 3.8/4.5 (magna cum laude)',
      verificationDate: '2022.03.10',
      degree: '학사',
      gpa: '3.8/4.5',
      activities: ['프로그래밍 동아리 회장', '해커톤 대회 우승']
    },
    {
      id: 3,
      title: '정보처리기사',
      company: '한국산업인력공단',
      period: '2022.08.20',
      role: '자격증 취득',
      status: 'verified',
      type: 'certificate',
      technologies: [],
      description: '정보처리기사 자격증 취득 (필기 85점, 실기 합격)',
      verificationDate: '2022.09.05',
      certificateNumber: 'KQ22080012345',
      issueDate: '2022.08.20'
    },
    {
      id: 4,
      title: 'AI 챗봇 서비스 개발',
      company: '스타트업 A',
      period: '2022.01 - 2022.08',
      role: '풀스택 개발자',
      status: 'verified',
      type: 'project',
      technologies: ['Python', 'FastAPI', 'React', 'PostgreSQL'],
      description: '자연어 처리 기반 고객 상담 챗봇 서비스 개발',
      verificationDate: '2022.09.05',
      achievements: ['고객 만족도 95% 달성', '응답 시간 50% 단축']
    },
    {
      id: 5,
      title: '네이버',
      company: '네이버',
      period: '2022.09 - 2024.01',
      role: '백엔드 개발자',
      status: 'verified',
      type: 'experience',
      technologies: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'MySQL'],
      description: '검색 서비스 백엔드 개발 및 대용량 트래픽 처리 시스템 구축',
      verificationDate: '2024.02.01',
      department: '검색개발팀',
      jobType: '정규직',
      achievements: ['검색 응답 속도 40% 개선', '시스템 안정성 99.9% 달성']
    },
    {
      id: 6,
      title: '모바일 앱 개발 부트캠프',
      company: '패스트캠퍼스',
      period: '2021.09 - 2022.02',
      role: '수강생',
      status: 'pending',
      type: 'education',
      technologies: ['React Native', 'JavaScript', 'Firebase'],
      description: '6개월 집중 모바일 앱 개발 과정 수료 (우수 수료생)',
      verificationDate: null,
      completionRate: '100%',
      finalProject: '음식 배달 앱 개발'
    },
    {
      id: 7,
      title: 'AWS Solutions Architect',
      company: 'Amazon Web Services',
      period: '2023.05.15',
      role: '자격증 취득',
      status: 'verified',
      type: 'certificate',
      technologies: [],
      description: 'AWS 솔루션 아키텍트 어소시에이트 자격증 취득',
      verificationDate: '2023.06.01',
      certificateNumber: 'AWS-SAA-2023-051234',
      issueDate: '2023.05.15',
      expiryDate: '2026.05.15'
    }
  ];

  const tabs = [
    { id: 'all', name: '전체', icon: FileText, count: careers.length },
    { id: 'experience', name: '근무경력', icon: Briefcase, count: careers.filter(c => c.type === 'experience').length },
    { id: 'project', name: '프로젝트', icon: Code, count: careers.filter(c => c.type === 'project').length },
    { id: 'education', name: '학력', icon: GraduationCap, count: careers.filter(c => c.type === 'education').length },
    { id: 'certificate', name: '자격증', icon: Award, count: careers.filter(c => c.type === 'certificate').length }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            검증완료
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Calendar className="h-3 w-3 mr-1" />
            검증대기
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            검증반려
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Code className="h-5 w-5 text-blue-600" />;
      case 'education':
        return <GraduationCap className="h-5 w-5 text-green-600" />;
      case 'certificate':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'experience':
        return <Briefcase className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'education':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'certificate':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'experience':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'koica':
        return <Star className="h-4 w-4" />;
      case 'oda_basic':
      case 'oda_advanced':
        return <BookOpen className="h-4 w-4" />;
      case 'project_management':
        return <Users className="h-4 w-4" />;
      case 'development_cooperation':
        return <Globe className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const renderCareerSpecificInfo = (career: any) => {
    switch (career.type) {
      case 'education':
        return (
          <div className="mt-3 space-y-2">
            {career.degree && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">학위:</span> {career.degree}
              </div>
            )}
            {career.gpa && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">학점:</span> {career.gpa}
              </div>
            )}
            {career.activities && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">주요 활동:</span> {career.activities}
              </div>
            )}
            {career.completionRate && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">수료율:</span> {career.completionRate}
              </div>
            )}
            {career.finalProject && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">최종 프로젝트:</span> {career.finalProject}
              </div>
            )}
          </div>
        );
      
      case 'certificate':
        return (
          <div className="mt-3 space-y-2">
            {career.certificateNumber && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">자격증 번호:</span> {career.certificateNumber}
              </div>
            )}
            {career.issueDate && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">발급일:</span> {career.issueDate}
              </div>
            )}
            {career.expiryDate && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">유효기간:</span> {career.expiryDate}
              </div>
            )}
          </div>
        );
      
      case 'experience':
        return (
          <div className="mt-3 space-y-2">
            {career.department && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">부서:</span> {career.department}
              </div>
            )}
            {career.jobType && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">고용형태:</span> {career.jobType}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         career.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || career.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // 통계 계산
  const totalCareers = careers.length;
  const verifiedCareers = careers.filter(c => c.status === 'verified').length;
  const pendingCareers = careers.filter(c => c.status === 'pending').length;
  const availableForCertificate = careers.filter(c => c.status === 'verified').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">경력 조회</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              등록한 모든 경력의 검증 상태를 확인하고 관리하세요.
              검증 완료된 경력은 언제든지 증명서로 발급받을 수 있습니다.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="경력명, 회사명으로 검색..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Expert Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">전문가 프로필</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <Edit className="h-4 w-4 mr-1" />
              수정
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {expertProfile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{expertProfile.name}</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200">
                      KOICA {expertProfile.koicaGrade}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 mb-2">{expertProfile.position}</p>
                  <p className="text-gray-600 mb-4">{expertProfile.company}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">이메일:</span> {expertProfile.email}
                    </div>
                    <div>
                      <span className="font-medium">연락처:</span> {expertProfile.phone}
                    </div>
                    <div>
                      <span className="font-medium">총 경력:</span> {expertProfile.totalExperience}
                    </div>
                    <div>
                      <span className="font-medium">검증된 경력:</span> {expertProfile.verifiedCareers}개
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">전문 분야:</span>
                    <div className="flex flex-wrap gap-2">
                      {expertProfile.specializations.map((spec, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">언어 능력:</span>
                    <div className="flex flex-wrap gap-2">
                      {expertProfile.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">획득 뱃지</h4>
              <div className="space-y-3">
                {expertProfile.badges.map((badge) => (
                  <div key={badge.id} className={`p-4 rounded-xl border ${badge.color}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getBadgeIcon(badge.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm mb-1">{badge.name}</h5>
                        {badge.level && (
                          <p className="text-xs opacity-80 mb-1">등급: {badge.level}</p>
                        )}
                        <p className="text-xs opacity-70">발급일: {badge.issueDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCareers}</div>
                <div className="text-sm text-gray-600">총 경력</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{verifiedCareers}</div>
                <div className="text-sm text-gray-600">검증완료</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingCareers}</div>
                <div className="text-sm text-gray-600">검증대기</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{availableForCertificate}</div>
                <div className="text-sm text-gray-600">발급가능</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {filteredCareers.length > 0 ? (
              <div className="space-y-6">
                {filteredCareers.map((career) => (
                  <div key={career.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(career.type).replace('text-', 'bg-').replace('-700', '-100')}`}>
                          {getTypeIcon(career.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                            {getStatusBadge(career.status)}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {career.company}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {career.period}
                            </div>
                            <div className="font-medium text-blue-600">
                              {career.role}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{career.description}</p>
                          
                          {/* Career Type Specific Information */}
                          {renderCareerSpecificInfo(career)}
                          
                          {career.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 mt-3">
                              <span className="text-sm font-medium text-gray-700 mr-2">기술 스택:</span>
                              {career.technologies.map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}

                          {career.achievements && career.achievements.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-700 mr-2">주요 성과:</span>
                              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                {career.achievements.map((achievement, index) => (
                                  <li key={index}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {career.verificationDate && (
                            <div className="text-xs text-gray-500 mt-3">
                              검증일: {career.verificationDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          상세보기
                        </button>
                        {career.status === 'verified' && (
                          <button className="flex items-center text-gray-600 hover:text-green-600 text-sm font-medium transition-colors">
                            <Download className="h-4 w-4 mr-1" />
                            증명서 발급
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
                          수정
                        </button>
                        {career.status === 'verified' && (
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            증명서 발급
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'all' ? '등록된 경력이 없습니다' : `등록된 ${tabs.find(t => t.id === activeTab)?.name}이 없습니다`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? '다른 검색어를 시도해보세요.' : '새로운 경력을 등록해보세요.'}
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  새 경력 등록하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-700 group-hover:text-blue-600">종합 경력증명서 발급</div>
                <div className="text-sm text-gray-500">모든 검증된 경력 포함</div>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group">
              <div className="text-center">
                <FileText className="h-8 w-8 text-gray-400 group-hover:text-green-600 mx-auto mb-2" />
                <div className="font-medium text-gray-700 group-hover:text-green-600">선택 경력증명서 발급</div>
                <div className="text-sm text-gray-500">원하는 경력만 선택</div>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
              <div className="text-center">
                <Download className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2" />
                <div className="font-medium text-gray-700 group-hover:text-purple-600">경력 데이터 내보내기</div>
                <div className="text-sm text-gray-500">PDF, Excel 형식</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerSearch;