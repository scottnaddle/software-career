import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, FileText, Shield, Users, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">K-Xpert</span>
                <div className="text-sm text-gray-600">글로벌 비즈니스 전문가 플랫폼</div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              K-Xpert는 글로벌 비즈니스 전문가들을 위한 경력 검증 및 증명서 발급 플랫폼입니다. 
              정부 공인 경력관리 시스템을 통해 신뢰할 수 있는 전문가 네트워크를 구축하고 있습니다.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <span>caind@caind.kr</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <span>02-539-7113</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <span>서울시 서초구 강남대로 69길 8 KI 타워 10층 1007호</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              서비스
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">경력 등록</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">전문가 검증</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">증명서 발급</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">기업 서비스</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">API 연동</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">경력 분석</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              지원
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">이용 안내</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">자주 묻는 질문</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">공지사항</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">전문가 가이드</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">기업 가이드</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">고객센터</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Globe className="h-6 w-6" />
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                개인정보처리방침
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                이용약관
              </Link>
              <Link to="/security" className="text-gray-600 hover:text-blue-600 transition-colors">
                보안정책
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-100 border-t border-gray-200" style={{ backgroundColor: '#eeeeee' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm" style={{ color: '#67768e' }}>
              <p>&copy; 2024 K-Xpert. All rights reserved.</p>
              <div className="flex space-x-4">
                <span>고유번호: 211-82-75543</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-sm text-gray-500">Powered by</span>
              <span className="text-sm font-semibold text-gray-700">CAIND(국제개발컨설팅협회)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;