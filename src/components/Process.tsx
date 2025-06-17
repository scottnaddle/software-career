import React from 'react';
import { UserPlus, FileText, Shield, Award, ArrowRight } from 'lucide-react';

const Process = () => {
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: '회원가입',
      description: '간단한 정보 입력으로 K-Xpert에 가입하세요.',
      details: ['기본 정보 입력', '이메일 인증', '프로필 설정'],
      color: 'blue'
    },
    {
      step: 2,
      icon: FileText,
      title: '경력 등록',
      description: '글로벌 비즈니스 프로젝트, 교육, 자격증 등 다양한 경력을 등록하세요.',
      details: ['상세 프로젝트 정보', '기술 스택 명시', '성과물 첨부'],
      color: 'green'
    },
    {
      step: 3,
      icon: Shield,
      title: '전문가 검증',
      description: '업계 전문가가 등록된 경력을 검토하고 블록체인 기술로 인증합니다.',
      details: ['전문가 검토', '블록체인 인증', '검증 완료 알림'],
      color: 'purple'
    },
    {
      step: 4,
      icon: Award,
      title: '증명서 발급',
      description: '검증된 경력을 바탕으로 공식 증명서를 발급받으세요.',
      details: ['즉시 발급 가능', 'PDF 다운로드', 'QR 코드 진위 확인'],
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-600',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-600',
        text: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            이용 방법
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            4단계의 간단한 과정으로 전문적인 경력 관리를 시작하세요.
            각 단계별로 상세한 가이드를 제공하여 누구나 쉽게 이용할 수 있습니다.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Process Flow */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-16">
              {steps.map((step, index) => {
                const colorClasses = getColorClasses(step.color);
                return (
                  <React.Fragment key={step.step}>
                    <div className="flex flex-col items-center max-w-xs">
                      <div className={`w-20 h-20 ${colorClasses.icon} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center mb-4 border-2 ${colorClasses.border}`}>
                        <span className={`text-lg font-bold ${colorClasses.text}`}>{step.step}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                      <p className="text-gray-600 text-center text-sm leading-relaxed mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-xs text-gray-500">
                            <div className={`w-1.5 h-1.5 ${colorClasses.icon} rounded-full mr-2`}></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center">
                        <ArrowRight className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Mobile Process Flow */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => {
              const colorClasses = getColorClasses(step.color);
              return (
                <div key={step.step} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 ${colorClasses.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`w-8 h-8 ${colorClasses.bg} rounded-full flex items-center justify-center mt-3 border-2 ${colorClasses.border}`}>
                      <span className={`text-sm font-bold ${colorClasses.text}`}>{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-xs text-gray-500">
                          <div className={`w-1.5 h-1.5 ${colorClasses.icon} rounded-full mr-2`}></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              지금 바로 시작하세요
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              회원가입부터 증명서 발급까지 전 과정이 체계적으로 관리됩니다.
              더 나은 경력을 위한 전문적인 경력 관리를 시작하세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
                회원가입하기
              </button>
              <button className="border-2 border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200">
                데모 체험하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;