import React from 'react';
import { CheckCircle, Shield, Clock, Globe, Award, Users } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: '신뢰할 수 있는 경력 관리',
      description: '블록체인 기술과 전문가 검증을 통한 위변조 불가능한 신뢰성 있는 경력 관리를 제공합니다.',
      stats: '99.9% 검증 정확도'
    },
    {
      icon: Clock,
      title: '신속한 증명서 발급',
      description: '언제 어디서나 즉시 공식 경력증명서를 발급받아 취업이나 이직에 활용할 수 있습니다.',
      stats: '평균 3분 발급'
    },
    {
      icon: Globe,
      title: '국제적 인정',
      description: '해외 취업이나 글로벌 기업 지원 시 활용할 수 있는 국제 표준 경력 관리를 제공합니다.',
      stats: '15개국 인정'
    },
    {
      icon: Award,
      title: '경력 성장 지원',
      description: '체계적인 경력 분석과 맞춤형 성장 방향 제시를 통해 글로벌 비즈니스 전문가의 지속적인 성장을 지원합니다.',
      stats: '평균 23% 연봉 상승'
    },
    {
      icon: Users,
      title: '네트워킹 기회',
      description: '검증된 글로벌 비즈니스 전문가들과의 네트워킹을 통해 새로운 기회와 협업 가능성을 발견하세요.',
      stats: '50,000+ 전문가 참여'
    },
    {
      icon: CheckCircle,
      title: '전문적인 서비스',
      description: '정부 공인 플랫폼으로서 전문적이고 체계적인 경력 관리 서비스를 제공합니다.',
      stats: '정부 공인'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            K-Xpert를 선택해야 하는 이유
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            단순한 이력서 관리를 넘어 글로벌 비즈니스 전문가 경력의 
            체계적이고 전문적인 관리를 위한 특별한 혜택을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <benefit.icon className="h-7 w-7 text-blue-600 group-hover:text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{benefit.stats}</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            이미 많은 글로벌 비즈니스 전문가들이 경험하고 있습니다
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-blue-100">등록된 전문가</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">120,000+</div>
              <div className="text-blue-100">검증된 경력</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">85,000+</div>
              <div className="text-blue-100">발급된 증명서</div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-lg text-white/90 italic mb-4">
              "K-Xpert를 통해 체계적으로 관리된 경력 덕분에 원하던 회사로 성공적으로 이직할 수 있었습니다. 
              검증된 경력증명서가 큰 도움이 되었어요."
            </p>
            <div className="text-white font-semibold">김글로벌, 시니어 글로벌 비즈니스 매니저</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;