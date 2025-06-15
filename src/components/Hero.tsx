import React from 'react';
import { Shield, FileText, Award, ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4 mr-2" />
            정부 공인 소프트웨어 경력관리 플랫폼
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            소프트웨어 개발자의
            <br />
            <span className="text-blue-600">경력을 체계적으로 관리하세요</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            개발 경력을 등록하고 검증받아 공식 경력증명서를 발급받으세요.
            <br />
            신뢰할 수 있는 경력 관리로 더 나은 커리어를 만들어가세요.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center justify-center">
              경력 등록하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
              서비스 둘러보기
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              정부 공인 서비스
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              블록체인 기반 검증
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              무료 이용
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <FileText className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">경력 등록</h3>
            <p className="text-gray-600 mb-6">
              개발 프로젝트, 교육 이수, 자격증 등 다양한 경력을 등록하고 검증받으세요.
            </p>
            <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">
              시작하기 <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <Shield className="h-8 w-8 text-green-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">경력 검증</h3>
            <p className="text-gray-600 mb-6">
              등록된 경력을 전문가가 검토하고 블록체인으로 안전하게 인증합니다.
            </p>
            <button className="text-green-600 font-semibold hover:text-green-700 flex items-center">
              확인하기 <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <Award className="h-8 w-8 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">증명서 발급</h3>
            <p className="text-gray-600 mb-6">
              검증된 경력을 바탕으로 공식 경력증명서를 언제든지 발급받으세요.
            </p>
            <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center">
              발급받기 <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;