import React, { useState } from 'react';
import { Search, Filter, Eye, Download, Shield, Calendar, MapPin, Code, Award, ExternalLink, GraduationCap, Briefcase, FileText, User } from 'lucide-react';

const CareerSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    period: 'all'
  });

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return '프로젝트';
      case 'education':
        return '학력';
      case 'certificate':
        return '자격증';
      case 'experience':
        return '근무경력';
      default:
        return '기타';
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
    const matchesStatus = selectedFilters.status === 'all' || career.status === selectedFilters.status;
    const matchesType = selectedFilters.type === 'all' || career.type === selectedFilters.type;
    
    return matchesSearch && matchesStatus && matchesType;
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

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="경력명, 회사명으로 검색..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
              >
                <option value="all">전체 상태</option>
                <option value="verified">검증완료</option>
                <option value="pending">검증대기</option>
                <option value="rejected">검증반려</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFilters.type}
                onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
              >
                <option value="all">전체 유형</option>
                <option value="experience">근무경력</option>
                <option value="project">프로젝트</option>
                <option value="education">학력</option>
                <option value="certificate">자격증</option>
              </select>
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

        {/* Career List */}
        <div className="space-y-6">
          {filteredCareers.map((career) => (
            <div key={career.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(career.type).replace('text-', 'bg-').replace('-700', '-100')}`}>
                      {getTypeIcon(career.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                        {getStatusBadge(career.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(career.type)}`}>
                          {getTypeLabel(career.type)}
                        </span>
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
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
            </div>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              다른 검색어나 필터 조건을 시도해보세요.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              새 경력 등록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSearch;