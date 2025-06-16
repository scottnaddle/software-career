import React, { useState } from 'react';
import { Building, Users, Shield, Search, BarChart3, Clock, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';

const EnterpriseService = () => {
  const [activeTab, setActiveTab] = useState('verification');

  const services = [
    {
      id: 'verification',
      name: '경력 검증',
      icon: Shield,
      description: '지원자의 경력을 빠르고 정확하게 검증',
      features: [
        '실시간 경력 검증',
        '블록체인 기반 신뢰성',
        '상세 검증 리포트',
        'API 연동 지원'
      ]
    },
    {
      id: 'search',
      name: '인재 검색',
      icon: Search,
      description: '검증된 개발자 풀에서 최적의 인재 발굴',
      features: [
        '기술 스택별 검색',
        '경력 수준별 필터링',
        '프로젝트 경험 매칭',
        '추천 알고리즘'
      ]
    },
    {
      id: 'analytics',
      name: '채용 분석',
      icon: BarChart3,
      description: '데이터 기반 채용 인사이트 제공',
      features: [
        '시장 동향 분석',
        '급여 벤치마킹',
        '채용 성과 측정',
        '맞춤형 리포트'
      ]
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '무료',
      description: '소규모 스타트업을 위한 기본 플랜',
      features: [
        '월 10회 경력 검증',
        '기본 검색 기능',
        '이메일 지원',
        '기본 리포트'
      ],
      cta: '무료 시작',
      popular: false
    },
    {
      name: 'Professional',
      price: '월 50만원',
      description: '성장하는 기업을 위한 전문 플랜',
      features: [
        '월 100회 경력 검증',
        '고급 검색 및 필터',
        '전화/채팅 지원',
        '상세 분석 리포트',
        'API 연동',
        '전담 매니저'
      ],
      cta: '14일 무료 체험',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '맞춤 견적',
      description: '대기업을 위한 엔터프라이즈 솔루션',
      features: [
        '무제한 경력 검증',
        '맞춤형 기능 개발',
        '24/7 전담 지원',
        '고급 분석 대시보드',
        'SSO 연동',
        '온프레미스 배포'
      ],
      cta: '상담 문의',
      popular: false
    }
  ];

  const testimonials = [
    {
      company: '네이버',
      logo: 'N',
      person: '김채용 (인사팀장)',
      content: 'SW Career를 통해 지원자 경력 검증 시간이 80% 단축되었습니다. 신뢰할 수 있는 정보로 더 나은 채용 결정을 내릴 수 있게 되었어요.',
      rating: 5
    },
    {
      company: '카카오',
      logo: 'K',
      person: '박개발 (CTO)',
      content: '검증된 개발자 풀에서 우수한 인재를 빠르게 찾을 수 있어서 채용 효율성이 크게 향상되었습니다.',
      rating: 5
    },
    {
      company: '토스',
      logo: 'T',
      person: '이인사 (HR 디렉터)',
      content: 'API 연동을 통해 기존 채용 시스템과 완벽하게 통합되어 업무 프로세스가 매우 효율적이 되었습니다.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              기업을 위한 스마트 채용 솔루션
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              검증된 소프트웨어 개발자 경력 정보를 활용하여 
              더 빠르고 정확한 채용 결정을 내리세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors">
                무료 체험 시작
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all">
                상담 문의
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              기업 전용 서비스
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              채용 프로세스의 모든 단계에서 필요한 도구와 인사이트를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  activeTab === service.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveTab(service.id)}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.name}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Service View */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'verification' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  실시간 경력 검증 시스템
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  지원자의 경력 정보를 즉시 검증하여 채용 과정의 신뢰성을 높이고 
                  시간을 절약하세요. 블록체인 기술로 보장되는 100% 신뢰할 수 있는 정보입니다.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">평균 3분 내 검증 완료</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">99.9% 검증 정확도</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">API 연동으로 자동화 가능</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">검증 결과 예시</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">프로젝트 경력</span>
                      <span className="text-green-600 font-medium">✓ 검증완료</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">기술 스택</span>
                      <span className="text-green-600 font-medium">✓ 검증완료</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">근무 기간</span>
                      <span className="text-green-600 font-medium">✓ 검증완료</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">담당 역할</span>
                      <span className="text-green-600 font-medium">✓ 검증완료</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">인재 검색 인터페이스</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Node.js</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">AWS</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">경력 수준</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>3-5년 (중급)</option>
                      </select>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                      검색 (127명 매칭)
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  검증된 인재 풀에서 최적의 매칭
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  50,000명 이상의 검증된 개발자 중에서 귀하의 요구사항에 
                  정확히 맞는 인재를 찾아보세요. AI 기반 매칭 알고리즘이 
                  최적의 후보자를 추천합니다.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">50,000+ 검증된 개발자</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">정교한 검색 및 필터링</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">AI 기반 매칭 점수</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  데이터 기반 채용 인사이트
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  시장 동향, 급여 벤치마킹, 채용 성과 등 다양한 데이터를 
                  분석하여 더 나은 채용 전략을 수립하세요.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700">실시간 시장 동향 분석</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700">채용 프로세스 최적화</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700">맞춤형 리포트 제공</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">분석 대시보드</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">평균 채용 기간</span>
                      <span className="font-semibold text-gray-900">23일</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">지원자 품질 점수</span>
                      <span className="font-semibold text-green-600">8.7/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">채용 성공률</span>
                      <span className="font-semibold text-blue-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              기업 규모에 맞는 요금제
            </h2>
            <p className="text-xl text-gray-600">
              스타트업부터 대기업까지, 모든 규모의 기업을 위한 솔루션
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg ${
                  plan.popular ? 'ring-2 ring-blue-500 relative' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      인기
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              고객사 성공 사례
            </h2>
            <p className="text-xl text-gray-600">
              이미 많은 기업들이 SW Career로 채용 혁신을 경험하고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.company}</div>
                    <div className="text-sm text-gray-600">{testimonial.person}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            14일 무료 체험으로 SW Career의 강력한 기능을 경험해보세요.
            설정비나 초기 비용 없이 바로 시작할 수 있습니다.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
              무료 체험 시작
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2" />
              전화 상담 예약
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-blue-100">
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              <span>02-2023-9999</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <span>enterprise@career.sw.or.kr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseService;