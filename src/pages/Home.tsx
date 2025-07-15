import React from 'react';

// 컴포넌트를 하나씩 테스트하기 위해 임시로 주석 처리
const Home = () => {
  try {
    return (
      <div>
        {/* 기본 Hero 섹션만 렌더링 */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
                K-Xpert 플랫폼에 오신 것을 환영합니다
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4 max-w-3xl mx-auto">
                글로벌 비즈니스 전문가를 위한 경력 검증 플랫폼
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                <a 
                  href="/career-registration"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-colors text-center"
                >
                  경력 등록하기
                </a>
                <a 
                  href="/expert-application"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all text-center"
                >
                  전문가 되기
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 주요 기능 소개 */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">주요 서비스</h2>
              <p className="text-base sm:text-lg text-gray-600 px-4">K-Xpert가 제공하는 핵심 서비스를 살펴보세요</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">경력 등록</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">글로벌 비즈니스 경험을 체계적으로 등록하고 관리하세요</p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">전문가 검증</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">업계 전문가가 귀하의 경력을 검토하고 인증합니다</p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">증명서 발급</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">검증된 경력을 바탕으로 공식 증명서를 발급받으세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">신뢰받는 플랫폼</h2>
              <p className="text-base sm:text-lg text-gray-600 px-4">전 세계 전문가들이 신뢰하는 K-Xpert</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">1,000+</div>
                <div className="text-sm sm:text-base text-gray-600">등록된 전문가</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-sm sm:text-base text-gray-600">검증된 경력</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">3,000+</div>
                <div className="text-sm sm:text-base text-gray-600">발급된 증명서</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-2">15+</div>
                <div className="text-sm sm:text-base text-gray-600">지원 국가</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Home component error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">페이지 로딩 중...</h1>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }
};

export default Home;