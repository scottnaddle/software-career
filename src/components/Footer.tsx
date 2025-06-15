import React from 'react';
import { Award, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, FileText, Shield, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">SW Career</span>
                <div className="text-xs text-gray-400">소프트웨어 경력관리 플랫폼</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              대한민국 최초의 정부 공인 소프트웨어 개발자 경력관리 플랫폼으로, 
              블록체인 기술을 활용한 신뢰할 수 있는 경력 검증 서비스를 제공합니다.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
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
                <a href="#" className="hover:text-blue-400 transition-colors">경력 검증</a>
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
              고객지원
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">이용안내</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">공지사항</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">개발자 가이드</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">기업 가이드</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">문의하기</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              연락처
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <span>02-2023-9999</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <span>support@career.sw.or.kr</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-blue-400 mt-1" />
                <span>서울특별시 강남구 테헤란로 311<br />아남타워빌딩 7층</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-semibold text-white mb-4">뉴스레터 구독</h4>
              <p className="text-gray-400 text-sm mb-4">
                최신 업데이트와 유용한 정보를 받아보세요.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 text-white text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors text-sm">
                  구독
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 SW Career. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">이용약관</a>
              <a href="#" className="hover:text-blue-400 transition-colors">개인정보처리방침</a>
              <span>사업자등록번호: 123-45-67890</span>
              <span>통신판매업신고: 제2024-서울강남-0123호</span>
            </div>
          </div>
          
          {/* Certifications */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap justify-center items-center space-x-8 text-xs text-gray-500">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-blue-400" />
                과학기술정보통신부 공인
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-400" />
                ISO 27001 인증
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-400" />
                블록체인 기술 적용
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;