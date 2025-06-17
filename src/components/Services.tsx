import React from 'react';
import { FileText, Shield, Award, Building, Users, Database } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: FileText,
      title: '경력 등록 및 관리',
      description: '글로벌 비즈니스 프로젝트, 교육, 자격증, 성과를 체계적으로 등록하고 관리하세요.',
      features: ['상세 프로젝트 정보 등록', '기술 및 역할 명시', '성과 및 결과물 첨부', '지속적인 업데이트 가능'],
      color: 'blue'
    },
    {
      icon: Shield,
      title: '전문가 검증 및 인증',
      description: '업계 전문가가 등록된 경력을 검토하고 블록체인 기술로 안전하게 인증하여 신뢰성을 보장합니다.',
      features: ['전문가 검토 시스템', '블록체인 기반 인증', '위변조 방지 기술', '실시간 검증 상태 확인'],
      color: 'green'
    },
    {
      icon: Award,
      title: '공식 증명서 발급',
      description: '검증된 경험을 바탕으로 정부 공인 경력증명서를 발급받아 취업이나 이직에 활용하세요.',
      features: ['PDF 형식 증명서', 'QR 코드 진위 확인', '다국어 지원', '즉시 발급 가능'],
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        accent: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        accent: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        accent: 'text-purple-600',
        border: 'border-purple-200'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            핵심 서비스
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            글로벌 비즈니스 전문가 경력을 체계적으로 관리하고 
            검증하기 위한 전문 플랫폼의 핵심 서비스를 소개합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const colorClasses = getColorClasses(service.color);
            return (
              <div
                key={index}
                className={`${colorClasses.bg} rounded-2xl p-8 border ${colorClasses.border} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    <service.icon className={`h-6 w-6 ${colorClasses.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className={`w-2 h-2 ${colorClasses.bg} rounded-full mr-3 border-2 ${colorClasses.border}`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Enterprise Services */}
        <div className="bg-gray-50 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">기업 서비스</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              채용 담당자와 HR 전문가를 위해 특별히 설계된 서비스입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">경력 검증 서비스</h4>
              <p className="text-gray-600 text-sm">
                지원자의 경력을 빠르고 정확하게 검증하여 채용 프로세스의 효율성을 높입니다.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">인재 매칭</h4>
              <p className="text-gray-600 text-sm">
                검증된 전문가 풀에서 귀하의 회사 요구사항에 맞는 최적의 인재를 추천합니다.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">API 연동</h4>
              <p className="text-gray-600 text-sm">
                귀하의 회사 HR 시스템과 연동하여 경력 검증 프로세스를 자동화합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;