import React, { useState } from 'react';
import { Download, FileText, Shield, Calendar, User, Award, QrCode, Share2, Printer, Eye, CreditCard, Clock } from 'lucide-react';

const CertificateIssue = () => {
  const [selectedCareers, setSelectedCareers] = useState<number[]>([]);
  const [certificateType, setCertificateType] = useState('comprehensive');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

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

  const certificatePlans = {
    basic: {
      name: '기본 증명서',
      price: 5000,
      features: ['PDF 다운로드', '기본 양식', '1년 보관'],
      delivery: '즉시 발급'
    },
    premium: {
      name: '프리미엄 증명서',
      price: 15000,
      features: ['PDF 다운로드', '고급 양식', 'QR 코드 인증', '영문 번역', '무제한 보관'],
      delivery: '즉시 발급'
    },
    official: {
      name: '공식 인증서',
      price: 25000,
      features: ['PDF 다운로드', '공식 양식', 'QR 코드 인증', '영문 번역', '우편 발송', '무제한 보관', '법적 효력'],
      delivery: '1-2일 처리'
    }
  };

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

  const handleCertificateIssue = (planType: string) => {
    setSelectedPlan(planType);
    setShowPaymentModal(true);
  };

  const PaymentModal = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardInfo, setCardInfo] = useState({
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    });

    const currentPlan = certificatePlans[selectedPlan as keyof typeof certificatePlans];
    const careerCount = certificateType === 'comprehensive' ? verifiedCareers.length : selectedCareers.length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">증명서 발급 결제</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Plan Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{currentPlan?.name}</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentPlan?.price.toLocaleString()}원
                  </div>
                  <div className="text-sm text-blue-600">{currentPlan?.delivery}</div>
                </div>
              </div>
              <div className="text-sm text-blue-700 mb-3">
                포함 경력: {careerCount}개 • {certificateType === 'comprehensive' ? '종합' : '선택'} 증명서
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                {currentPlan?.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Shield className="h-3 w-3 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">결제 방법</h4>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                  <span>신용카드/체크카드</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>계좌이체</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="kakao"
                    checked={paymentMethod === 'kakao'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>카카오페이</span>
                </label>
              </div>
            </div>

            {/* Card Information */}
            {paymentMethod === 'card' && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">카드 정보</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="카드번호 (0000-0000-0000-0000)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cardInfo.number}
                    onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={cardInfo.cvc}
                      onChange={(e) => setCardInfo({...cardInfo, cvc: e.target.value})}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="카드소유자명"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-blue-600">{currentPlan?.price.toLocaleString()}원</span>
              </div>
            </div>

            {/* Payment Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
              {currentPlan?.price.toLocaleString()}원 결제하기
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              결제 완료 후 증명서가 발급됩니다. 환불 정책은 이용약관을 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    );
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

            {/* Certificate Plans */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">증명서 플랜 선택</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(certificatePlans).map(([key, plan]) => (
                  <div
                    key={key}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all"
                  >
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {plan.price.toLocaleString()}원
                      </div>
                      <div className="text-sm text-gray-600">{plan.delivery}</div>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <Shield className="h-3 w-3 mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handleCertificateIssue(key)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        key === 'premium'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                      }`}
                      disabled={certificateType === 'selective' && selectedCareers.length === 0}
                    >
                      선택하기
                    </button>
                  </div>
                ))}
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

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default CertificateIssue;