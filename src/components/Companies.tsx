import React from 'react';
import { Star, Users, MapPin, ExternalLink } from 'lucide-react';

const Companies = () => {
  const companies = [
    {
      id: 1,
      name: '네이버',
      logo: 'N',
      rating: 4.5,
      employees: '3,000+',
      location: '서울',
      description: '글로벌 인터넷 서비스 기업으로 검색, 커머스, 핀테크, 클라우드 등 다양한 서비스를 제공합니다.',
      tags: ['검색엔진', '클라우드', '커머스', 'AI'],
      openJobs: 45,
      logoColor: 'bg-green-500'
    },
    {
      id: 2,
      name: '카카오',
      logo: 'K',
      rating: 4.3,
      employees: '4,500+',
      location: '경기',
      description: '모바일 중심의 인터넷 서비스 기업으로 메신저, 콘텐츠, 커머스 등의 플랫폼을 운영합니다.',
      tags: ['메신저', '콘텐츠', '커머스', '모빌리티'],
      openJobs: 67,
      logoColor: 'bg-yellow-500'
    },
    {
      id: 3,
      name: '토스',
      logo: 'T',
      rating: 4.6,
      employees: '2,000+',
      location: '서울',
      description: '혁신적인 금융 서비스를 제공하는 핀테크 기업으로 간편송금, 투자, 대출 등의 서비스를 운영합니다.',
      tags: ['핀테크', '간편결제', '투자', '보험'],
      openJobs: 32,
      logoColor: 'bg-blue-500'
    },
    {
      id: 4,
      name: '배달의민족',
      logo: 'B',
      rating: 4.2,
      employees: '1,800+',
      location: '서울',
      description: '국내 1위 음식 배달 플랫폼으로 배달, 포장주문, 테이블오더 등의 서비스를 제공합니다.',
      tags: ['음식배달', '플랫폼', 'O2O', '물류'],
      openJobs: 28,
      logoColor: 'bg-red-500'
    },
    {
      id: 5,
      name: '쿠팡',
      logo: 'C',
      rating: 4.1,
      employees: '5,000+',
      location: '서울',
      description: '고객중심의 이커머스 기업으로 로켓배송, 로켓프레시 등 혁신적인 물류 서비스를 제공합니다.',
      tags: ['이커머스', '물류', '로켓배송', '마켓플레이스'],
      openJobs: 89,
      logoColor: 'bg-purple-500'
    },
    {
      id: 6,
      name: '라인',
      logo: 'L',
      rating: 4.4,
      employees: '2,500+',
      location: '서울',
      description: '글로벌 메신저 플랫폼을 기반으로 다양한 라이프스타일 서비스를 제공하는 기업입니다.',
      tags: ['메신저', '엔터테인먼트', '금융', '커머스'],
      openJobs: 53,
      logoColor: 'bg-green-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            주목받는 기업들
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            개발자들이 선호하는 국내 대표 IT 기업들을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-14 h-14 ${company.logoColor} rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4`}>
                    {company.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600 font-medium">{company.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {company.openJobs}개 채용중
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">{company.employees} 직원</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{company.location}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {company.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {company.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                  채용공고 보기
                  <ExternalLink className="h-4 w-4 ml-1" />
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-gray-600 hover:text-blue-600">
                  <Star className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200">
            모든 기업 보기
          </button>
        </div>
      </div>
    </section>
  );
};

export default Companies;