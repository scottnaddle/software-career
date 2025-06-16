import React, { useState } from 'react';
import { Download, FileText, Shield, Calendar, User, Award, QrCode, Share2, Printer, Eye } from 'lucide-react';

const CertificateIssue = () => {
  const [selectedCareers, setSelectedCareers] = useState<number[]>([]);
  const [certificateType, setCertificateType] = useState('comprehensive');

  const verifiedCareers = [
    {
      id: 1,
      title: '전자상거래 플랫폼 개발',
      company: '네이버',
      period: '2023.03 - 2023.12',
      role: '백엔드 개발자',
      type: 'project',
      verificationDate: '2024.01.15'
    },
    {
      id: 2,
      title: '모바일 앱 개발 부트캠프',
      company: '패스트캠퍼스',
      period: '2022.09 - 2023.02',
      role: '수강생',
      type: 'education',
      verificationDate: '2023.03.10'
    },
    {
      id: 4,
      title: 'AI 챗봇 서비스 개발',
      company: '스타트업 A',
      period: '2022.01 - 2022.08',
      role: '풀스택 개발자',
      type: 'project',
      verificationDate: '2022.09.05'
    }
  ];

  const issuedCertificates = [
    {
      id: 'CERT-2024-001',
      type: '종합 경력증명서',
      issueDate: '2024.01.20',
      careers: 3,
      status: 'active'
    },
    {
      id: 'CERT-2023-045',
      type: '프로젝트 경력증명서',
      issueDate: '2023.12.15',
      careers: 1,
      status: 'active'
    }
  ];

  const toggleCareerSelection = (careerId: number) => {
    setSelectedCareers(prev => 
      prev.includes(careerId) 
        ? prev.filter(id => id !== careerId)
        : [...prev, careerId]
    );
  };

  const selectAllCareers = () => {
    setSelectedCareers(verifiedCareers.map(career => career.id));
  };

  const clearSelection = () => {
    setSelectedCareers([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">증명서 발급</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              검증된 경력을 바탕으로 공식 경력증명서를 발급받으세요.
              발급된 증명서는 QR 코드를 통해 진위 여부를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Issue Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Certificate Type Selection */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">증명서 유형 선택</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    certificateType === 'comprehensive'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setCertificateType('comprehensive')}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">종합 경력증명서</h3>
                      <p className="text-sm text-gray-600">모든 검증된 경력 포함</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    프로젝트, 교육, 자격증 등 모든 검증된 경력을 포함한 종합 증명서
                  </p>
                </div>

                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    certificateType === 'selective'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setCertificateType('selective')}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">선택 경력증명서</h3>
                      <p className="text-sm text-gray-600">원하는 경력만 선택</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    특정 목적에 맞게 원하는 경력만 선택하여 발급하는 증명서
                  </p>
                </div>
              </div>
            </div>

            {/* Career Selection */}
            {certificateType === 'selective' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">경력 선택</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllCareers}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      전체 선택
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={clearSelection}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      선택 해제
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {verifiedCareers.map((career) => (
                    <div
                      key={career.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedCareers.includes(career.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleCareerSelection(career.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCareers.includes(career.id)}
                          onChange={() => toggleCareerSelection(career.id)}
                          className="h-4 w-4 text-blue-600 rounded mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{career.title}</h3>
                            <span className="text-sm text-gray-500">{career.period}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <span>{career.company}</span>
                            <span className="mx-2">•</span>
                            <span>{career.role}</span>
                            <span className="mx-2">•</span>
                            <span>검증일: {career.verificationDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Button */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">증명서 발급 준비 완료</h3>
                  <p className="text-sm text-gray-600">
                    {certificateType === 'comprehensive' 
                      ? `총 ${verifiedCareers.length}개의 검증된 경력이 포함됩니다.`
                      : `선택된 ${selectedCareers.length}개의 경력이 포함됩니다.`
                    }
                  </p>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
                  disabled={certificateType === 'selective' && selectedCareers.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  증명서 발급
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Statistics */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">발급 현황</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">검증된 경력</span>
                  <span className="font-semibold text-gray-900">{verifiedCareers.length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">발급된 증명서</span>
                  <span className="font-semibold text-gray-900">{issuedCertificates.length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">이번 달 발급</span>
                  <span className="font-semibold text-gray-900">3개</span>
                </div>
              </div>
            </div>

            {/* Certificate Features */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">증명서 특징</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">블록체인 인증</h4>
                    <p className="text-sm text-gray-600">위변조 불가능한 보안</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <QrCode className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">QR 코드 검증</h4>
                    <p className="text-sm text-gray-600">즉시 진위 확인 가능</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">정부 공인</h4>
                    <p className="text-sm text-gray-600">공식 인정 증명서</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4 mr-2" />
                  증명서 미리보기
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  링크로 공유
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Printer className="h-4 w-4 mr-2" />
                  인쇄용 버전
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Issued Certificates History */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">발급 이력</h2>
          
          <div className="space-y-4">
            {issuedCertificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.type}</h3>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>증명서 ID: {cert.id}</span>
                      <span>발급일: {cert.issueDate}</span>
                      <span>포함 경력: {cert.careers}개</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    유효
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    다운로드
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 font-medium text-sm">
                    공유
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateIssue;