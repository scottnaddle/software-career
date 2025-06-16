import React, { useState } from 'react';
import { Book, Video, FileText, HelpCircle, Search, ChevronRight, Play, Download, ExternalLink } from 'lucide-react';

const Guide = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      name: '시작하기',
      icon: Book,
      description: '처음 사용자를 위한 기본 가이드'
    },
    {
      id: 'career-registration',
      name: '경력 등록',
      icon: FileText,
      description: '경력 등록 방법과 팁'
    },
    {
      id: 'verification',
      name: '경력 검증',
      icon: HelpCircle,
      description: '검증 프로세스 이해하기'
    },
    {
      id: 'certificate',
      name: '증명서 발급',
      icon: Download,
      description: '증명서 발급 및 활용법'
    },
    {
      id: 'enterprise',
      name: '기업 서비스',
      icon: ExternalLink,
      description: '기업용 기능 가이드'
    }
  ];

  const guides = {
    'getting-started': [
      {
        title: 'SW Career 시작하기',
        description: '회원가입부터 첫 경력 등록까지 단계별 안내',
        type: 'article',
        duration: '5분',
        difficulty: '초급',
        popular: true
      },
      {
        title: '플랫폼 소개 영상',
        description: 'SW Career의 주요 기능과 특징을 영상으로 확인',
        type: 'video',
        duration: '3분',
        difficulty: '초급',
        popular: true
      },
      {
        title: '자주 묻는 질문 (FAQ)',
        description: '사용자들이 가장 많이 묻는 질문과 답변',
        type: 'faq',
        duration: '10분',
        difficulty: '초급',
        popular: false
      }
    ],
    'career-registration': [
      {
        title: '프로젝트 경력 등록 가이드',
        description: '개발 프로젝트 경력을 효과적으로 등록하는 방법',
        type: 'article',
        duration: '8분',
        difficulty: '초급',
        popular: true
      },
      {
        title: '교육 이수 내역 등록',
        description: '부트캠프, 온라인 강의 등 교육 경력 등록법',
        type: 'article',
        duration: '5분',
        difficulty: '초급',
        popular: false
      },
      {
        title: '자격증 등록 및 인증',
        description: 'IT 관련 자격증을 등록하고 인증받는 방법',
        type: 'article',
        duration: '6분',
        difficulty: '초급',
        popular: false
      },
      {
        title: '경력 등록 모범 사례',
        description: '검증 통과율을 높이는 경력 작성 팁',
        type: 'video',
        duration: '12분',
        difficulty: '중급',
        popular: true
      }
    ],
    'verification': [
      {
        title: '경력 검증 프로세스 이해하기',
        description: '검증 단계별 과정과 소요 시간 안내',
        type: 'article',
        duration: '7분',
        difficulty: '초급',
        popular: true
      },
      {
        title: '검증 반려 사유와 대응법',
        description: '검증이 반려되는 주요 사유와 해결 방법',
        type: 'article',
        duration: '10분',
        difficulty: '중급',
        popular: true
      },
      {
        title: '블록체인 인증 시스템',
        description: 'SW Career의 블록체인 기반 검증 기술 소개',
        type: 'video',
        duration: '8분',
        difficulty: '고급',
        popular: false
      }
    ],
    'certificate': [
      {
        title: '경력증명서 발급 방법',
        description: '종합/선택 증명서 발급 과정 안내',
        type: 'article',
        duration: '5분',
        difficulty: '초급',
        popular: true
      },
      {
        title: '증명서 진위 확인하기',
        description: 'QR 코드를 통한 증명서 진위 확인 방법',
        type: 'article',
        duration: '3분',
        difficulty: '초급',
        popular: false
      },
      {
        title: '증명서 활용 사례',
        description: '취업, 이직, 프리랜서 활동에서의 증명서 활용법',
        type: 'video',
        duration: '15분',
        difficulty: '중급',
        popular: true
      }
    ],
    'enterprise': [
      {
        title: '기업 서비스 시작하기',
        description: '기업 계정 생성부터 첫 검증까지',
        type: 'article',
        duration: '10분',
        difficulty: '초급',
        popular: true
      },
      {
        title: 'API 연동 가이드',
        description: '기존 HR 시스템과 SW Career API 연동 방법',
        type: 'article',
        duration: '20분',
        difficulty: '고급',
        popular: false
      },
      {
        title: '채용 분석 대시보드 활용',
        description: '데이터 기반 채용 인사이트 활용법',
        type: 'video',
        duration: '12분',
        difficulty: '중급',
        popular: true
      }
    ]
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'faq':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급':
        return 'bg-green-100 text-green-800';
      case '중급':
        return 'bg-yellow-100 text-yellow-800';
      case '고급':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentGuides = guides[activeCategory as keyof typeof guides] || [];
  const filteredGuides = currentGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">이용 안내</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SW Career를 효과적으로 활용할 수 있도록 도와드리는 
              상세한 가이드와 튜토리얼을 제공합니다.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="가이드 검색..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="h-5 w-5 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">빠른 링크</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-blue-700 hover:text-blue-800">
                    • 회원가입하기
                  </a>
                  <a href="#" className="block text-sm text-blue-700 hover:text-blue-800">
                    • 경력 등록하기
                  </a>
                  <a href="#" className="block text-sm text-blue-700 hover:text-blue-800">
                    • 고객센터 문의
                  </a>
                  <a href="#" className="block text-sm text-blue-700 hover:text-blue-800">
                    • API 문서
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm">
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  {categories.find(cat => cat.id === activeCategory)?.icon && (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      {React.createElement(categories.find(cat => cat.id === activeCategory)!.icon, {
                        className: "h-5 w-5 text-blue-600"
                      })}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {categories.find(cat => cat.id === activeCategory)?.name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {categories.find(cat => cat.id === activeCategory)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guides List */}
              <div className="p-6">
                {filteredGuides.length > 0 ? (
                  <div className="space-y-6">
                    {filteredGuides.map((guide, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                {getTypeIcon(guide.type)}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {guide.title}
                              </h3>
                              {guide.popular && (
                                <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                  인기
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-4">{guide.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center text-gray-500">
                                <span>소요시간: {guide.duration}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                                {guide.difficulty}
                              </span>
                              <span className="capitalize text-gray-500">
                                {guide.type === 'video' ? '동영상' : 
                                 guide.type === 'article' ? '문서' : 
                                 guide.type === 'faq' ? 'FAQ' : '가이드'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center ml-4">
                            {guide.type === 'video' && (
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <Play className="h-5 w-5 text-red-600" />
                              </div>
                            )}
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-600">
                      다른 검색어를 시도하거나 다른 카테고리를 선택해보세요.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Guides */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 가이드</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">플랫폼 소개 영상</h4>
                    <p className="text-sm text-gray-600">3분 • 초급</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">경력 등록 가이드</h4>
                    <p className="text-sm text-gray-600">8분 • 초급</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  더 자세한 도움이 필요하신가요?
                </h3>
                <p className="text-gray-600 mb-6">
                  가이드로 해결되지 않는 문제가 있다면 고객센터로 문의해주세요.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    고객센터 문의
                  </button>
                  <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-all">
                    FAQ 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;