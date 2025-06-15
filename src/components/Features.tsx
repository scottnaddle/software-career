import React from 'react';
import { Shield, Target, Users, Zap, Award, Clock } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: '검증된 기업만',
      description: '엄격한 심사를 통과한 우수 기업들만 입점하여 안전하고 신뢰할 수 있는 채용 정보를 제공합니다.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Target,
      title: '맞춤형 추천',
      description: 'AI 기반 추천 시스템으로 당신의 경력과 기술스택에 최적화된 채용공고를 추천해드립니다.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Users,
      title: '현직자 리뷰',
      description: '실제 재직 중인 개발자들의 솔직한 기업 리뷰와 면접 후기로 더 나은 선택을 도와드립니다.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: Zap,
      title: '빠른 지원',
      description: '원클릭 지원으로 간편하게 채용에 지원하고, 실시간 지원 현황을 확인할 수 있습니다.',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      icon: Award,
      title: '경력 관리',
      description: '체계적인 이력서 관리와 경력 분석으로 개발자로서의 성장 방향을 제시해드립니다.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Clock,
      title: '실시간 알림',
      description: '관심 기업의 새로운 채용공고나 지원 현황 변경시 즉시 알림을 받아보세요.',
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            왜 SW Career를 선택해야 할까요?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            개발자들을 위해 특별히 설계된 플랫폼으로, 
            단순한 채용 정보 제공을 넘어 커리어 성장까지 함께 합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:border-blue-200"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            수천 개의 개발자 채용공고와 검증된 기업 정보를 무료로 확인해보세요
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200">
              회원가입 하기
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
              채용공고 둘러보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;