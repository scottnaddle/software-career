import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">SW</span>
              </div>
              <span className="text-2xl font-bold text-white">Career</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              대한민국 최고의 소프트웨어 개발자 채용 플랫폼으로, 
              개발자와 기업을 연결하는 신뢰할 수 있는 서비스입니다.
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
            <h3 className="text-lg font-semibold text-white mb-6">서비스</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">채용정보</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">기업정보</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">인재풀</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">커뮤니티</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">개발자 도구</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">기업 서비스</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">고객지원</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">도움말</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">공지사항</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">이용약관</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">개인정보처리방침</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">신고하기</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">연락처</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <span>contact@career.sw.or.kr</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-blue-400 mt-1" />
                <span>서울특별시 강남구 테헤란로 427<br />위워크 타워 15층</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-semibold text-white mb-4">뉴스레터 구독</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 text-white"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors">
                  구독
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 SW Career. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="text-gray-400 text-sm">사업자등록번호: 123-45-67890</span>
            <span className="text-gray-400 text-sm">통신판매업신고: 제2024-서울강남-1234호</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;