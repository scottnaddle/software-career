import React from 'react';
import { TrendingUp, Users, Award, Building, Globe, Clock } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';

const Statistics = () => {
  const { statistics, loading } = useStatistics();

  const stats = [
    {
      icon: Users,
      number: statistics.total_users?.toLocaleString() || '50,247',
      label: '등록된 전문가',
      description: '검증된 글로벌 비즈니스 전문가 참여',
      growth: '+15%'
    },
    {
      icon: Award,
      number: statistics.verified_careers?.toLocaleString() || '127,893',
      label: '검증된 경력',
      description: '업계 전문가가 검토한 신뢰할 수 있는 경력',
      growth: '+23%'
    },
    {
      icon: Building,
      number: statistics.partner_companies?.toLocaleString() || '2,847',
      label: '파트너 기업',
      description: '경력 검증 서비스를 이용하는 기업',
      growth: '+31%'
    },
    {
      icon: Globe,
      number: statistics.supported_countries?.toString() || '15',
      label: '지원 국가',
      description: '글로벌 표준 경력증명서 인정 국가',
      growth: '+3'
    }
  ];

  const achievements = [
    {
      title: '정부 공인 서비스',
      description: '정부가 인증한 글로벌 비즈니스 전문가 경력관리 플랫폼',
      icon: Award,
      color: 'blue'
    },
    {
      title: '블록체인 인증',
      description: '위변조 불가능한 블록체인 기술로 경력 정보 보호',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'ISO 27001 인증',
      description: '국제 표준 정보보안 관리체계 인증 획득',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            신뢰받는 플랫폼
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            수많은 글로벌 비즈니스 전문가와 기업이 선택한 K-Xpert의 
            성과와 신뢰성을 보여주는 주요 지표를 확인해보세요.
          </p>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                <stat.icon className="h-8 w-8 text-blue-600 group-hover:text-white" />
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                  {stat.growth}
                </div>
              </div>
              
              <div className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</div>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              인증 및 성과
            </h3>
            <p className="text-lg text-gray-600">
              K-Xpert가 받은 주요 인증과 성과를 소개합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => {
              const getColorClasses = (color: string) => {
                const colors = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-green-50 text-green-600',
                  purple: 'bg-purple-50 text-purple-600'
                };
                return colors[color as keyof typeof colors];
              };

              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${getColorClasses(achievement.color)} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <achievement.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">K-Xpert 발전 과정</h3>
            <p className="text-blue-100 text-lg">
              지속적인 혁신과 발전을 통해 더 나은 서비스를 제공하고 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2021</div>
              <div className="text-blue-100 text-sm">서비스 출시</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2022</div>
              <div className="text-blue-100 text-sm">정부 공인 획득</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2023</div>
              <div className="text-blue-100 text-sm">블록체인 도입</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2024</div>
              <div className="text-blue-100 text-sm">글로벌 확장</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;