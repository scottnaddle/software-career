import React, { useState, useEffect } from 'react';
import { Download, FileText, Shield, Calendar, User, Award, QrCode, Share2, Printer, Eye, CreditCard, Clock } from 'lucide-react';

const CertificateIssue = () => {
  const [selectedCareers, setSelectedCareers] = useState<number[]>([]);
  const [certificateType, setCertificateType] = useState('comprehensive');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [issuedCertificate, setIssuedCertificate] = useState<any>(null);
  const [showIssueSuccess, setShowIssueSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [allIssuedCertificates, setAllIssuedCertificates] = useState([]);

  useEffect(() => {
    console.log('CertificateIssue component mounted successfully');
    // 기존 발급 이력 로드
    loadIssuedCertificates();
  }, []);

  const loadIssuedCertificates = () => {
    try {
      const stored = localStorage.getItem('issuedCertificates');
      if (stored) {
        setAllIssuedCertificates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load issued certificates:', error);
    }
  };

  const saveIssuedCertificate = (certificate: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem('issuedCertificates') || '[]');
      const updated = [certificate, ...existing];
      localStorage.setItem('issuedCertificates', JSON.stringify(updated));
      setAllIssuedCertificates(updated);
    } catch (error) {
      console.error('Failed to save certificate:', error);
    }
  };

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

  // 하드코딩된 데이터 제거 - allIssuedCertificates 사용

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

  const generatePrintVersion = () => {
    const selectedCareersList = certificateType === 'comprehensive' 
      ? verifiedCareers 
      : verifiedCareers.filter(career => selectedCareers.includes(career.id));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>K-Xpert 경력증명서 - 인쇄용</title>
        <style>
          body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 20px; }
          .career-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
          .career-title { font-weight: bold; margin-bottom: 5px; }
          .career-details { color: #666; font-size: 14px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">K-Xpert 경력증명서</div>
          <div class="subtitle">글로벌 비즈니스 전문가 플랫폼</div>
          <div>발급일: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <h3>검증된 경력 목록 (${selectedCareersList.length}개)</h3>
        ${selectedCareersList.map(career => `
          <div class="career-item">
            <div class="career-title">${career.title}</div>
            <div class="career-details">
              ${career.company} | ${career.role} | ${career.period}
            </div>
          </div>
        `).join('')}
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          이 증명서는 K-Xpert 플랫폼에서 검증된 경력 정보를 바탕으로 발급되었습니다.<br>
          QR 코드 검증: https://verify.k-xpert.com
        </div>
        
        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">인쇄하기</button>
      </body>
      </html>
    `;
  };

  const PaymentModal = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardInfo, setCardInfo] = useState({
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const currentPlan = certificatePlans[selectedPlan as keyof typeof certificatePlans];
    const careerCount = certificateType === 'comprehensive' ? verifiedCareers.length : selectedCareers.length;

    const handlePayment = async () => {
      setIsProcessing(true);
      
      try {
        console.log('결제 처리 시작:', {
          plan: selectedPlan,
          amount: currentPlan?.price,
          method: paymentMethod,
          cardInfo: paymentMethod === 'card' ? cardInfo : null
        });

        // 시뮬레이션을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 테스트 모드에서는 항상 성공
        if (import.meta.env.VITE_PAYMENT_TEST_MODE === 'true') {
          console.log('테스트 결제 성공!');
          
          // 증명서 생성
          const newCertificate = {
            id: `CERT-${Date.now()}`,
            type: currentPlan?.name || '증명서',
            plan: selectedPlan,
            amount: currentPlan?.price || 0,
            paymentMethod: getPaymentMethodName(paymentMethod),
            issueDate: new Date().toLocaleDateString(),
            careers: certificateType === 'comprehensive' ? verifiedCareers.length : selectedCareers.length,
            status: 'active',
            downloadUrl: '#', // 실제로는 PDF 생성 후 URL
            qrCode: `https://verify.k-xpert.com/cert/${Date.now()}` // 실제 검증 URL
          };

          setIssuedCertificate(newCertificate);
          saveIssuedCertificate(newCertificate);
          setShowPaymentModal(false);
          setShowIssueSuccess(true);
        } else {
          // 실제 결제 로직은 여기에 구현
          console.log('실제 결제 처리 필요');
        }
      } catch (error) {
        console.error('결제 처리 오류:', error);
        alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsProcessing(false);
      }
    };

    const getPaymentMethodName = (method: string) => {
      switch (method) {
        case 'card': return '신용카드/체크카드';
        case 'transfer': return '계좌이체';
        case 'kakao': return '카카오페이';
        default: return method;
      }
    };

    const isPaymentValid = () => {
      if (paymentMethod === 'card') {
        return cardInfo.number && cardInfo.expiry && cardInfo.cvc && cardInfo.name;
      }
      return true; // 다른 결제방법은 추가 검증 없이 허용
    };

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
                  <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded">테스트 가능</span>
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
                  <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded">테스트 가능</span>
                </label>
              </div>
            </div>

            {/* Card Information */}
            {paymentMethod === 'card' && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">카드 정보</h4>
                
                {/* Test Card Info Display */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-green-800 mb-2">🧪 테스트 카드 정보</div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>카드번호: 4242-4242-4242-4242 (Visa)</div>
                    <div>유효기간: 12/34 | CVC: 123</div>
                    <div>카드소유자: 홍길동</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardInfo({
                      number: '4242-4242-4242-4242',
                      expiry: '12/34',
                      cvc: '123',
                      name: '홍길동'
                    })}
                    className="text-xs text-green-600 hover:text-green-700 mt-2 underline"
                  >
                    자동 입력
                  </button>
                </div>

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
            <button 
              onClick={handlePayment}
              disabled={!isPaymentValid() || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  처리 중...
                </>
              ) : (
                `${currentPlan?.price.toLocaleString()}원 결제하기`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              결제 완료 후 증명서가 발급됩니다. 환불 정책은 이용약관을 확인해주세요.
            </p>

            {/* Test Mode Notice */}
            {import.meta.env.VITE_PAYMENT_TEST_MODE === 'true' && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                <div className="text-xs font-medium text-yellow-800">🧪 테스트 모드</div>
                <div className="text-xs text-yellow-700">실제 결제가 발생하지 않습니다</div>
              </div>
            )}
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
                  <span className="font-semibold text-gray-900">{allIssuedCertificates.length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">이번 달 발급</span>
                  <span className="font-semibold text-gray-900">
                    {allIssuedCertificates.filter(cert => {
                      const certDate = new Date(cert.issueDate);
                      const now = new Date();
                      return certDate.getMonth() === now.getMonth() && 
                             certDate.getFullYear() === now.getFullYear();
                    }).length}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">총 결제 금액</span>
                  <span className="font-semibold text-blue-600">
                    {allIssuedCertificates.reduce((sum, cert) => sum + (cert.amount || 0), 0).toLocaleString()}원
                  </span>
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
                <button 
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  증명서 미리보기
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  링크로 공유
                </button>
                <button 
                  onClick={() => {
                    console.log('인쇄용 버전 생성');
                    const printContent = generatePrintVersion();
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
          
          {allIssuedCertificates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">발급된 증명서가 없습니다</h3>
              <p className="text-gray-600">
                첫 번째 경력증명서를 발급해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allIssuedCertificates.map((cert: any) => (
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
                        <span>금액: {cert.amount?.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {cert.status === 'active' ? '유효' : '만료'}
                    </span>
                    <button 
                      onClick={() => {
                        console.log('PDF 다운로드:', cert.downloadUrl);
                        alert(`${cert.type} PDF를 다운로드합니다.`);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      다운로드
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(cert.qrCode || `https://verify.k-xpert.com/cert/${cert.id}`);
                        alert('증명서 검증 링크가 복사되었습니다.');
                      }}
                      className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                    >
                      공유
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}

      {/* Certificate Issue Success Modal */}
      {showIssueSuccess && issuedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">증명서 발급 완료!</h2>
                <p className="text-gray-600">
                  경력증명서가 성공적으로 발급되었습니다.
                </p>
              </div>

              {/* Certificate Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">증명서 번호</span>
                    <div className="font-semibold text-gray-900">{issuedCertificate.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">발급일</span>
                    <div className="font-semibold text-gray-900">{issuedCertificate.issueDate}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">증명서 유형</span>
                    <div className="font-semibold text-gray-900">{issuedCertificate.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">포함 경력</span>
                    <div className="font-semibold text-gray-900">{issuedCertificate.careers}개</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">결제 정보</span>
                    <div className="font-semibold text-gray-900">
                      {issuedCertificate.amount.toLocaleString()}원 ({issuedCertificate.paymentMethod})
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  QR 코드로 증명서 진위를 확인할 수 있습니다
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {issuedCertificate.qrCode}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    console.log('PDF 다운로드:', issuedCertificate.downloadUrl);
                    alert('PDF 다운로드 기능이 실행됩니다.\n(실제로는 증명서 PDF가 다운로드됩니다)');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  증명서 PDF 다운로드
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      console.log('이메일 전송');
                      alert('증명서가 등록된 이메일로 전송됩니다.');
                    }}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    이메일 전송
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(issuedCertificate.qrCode);
                      alert('검증 URL이 복사되었습니다.');
                    }}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    링크 복사
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowIssueSuccess(false);
                    setIssuedCertificate(null);
                    // 발급된 증명서를 기존 목록에 추가
                    window.location.reload(); // 간단한 새로고침으로 상태 초기화
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Preview Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">증명서 미리보기</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Certificate Preview */}
              <div className="border-2 border-gray-200 rounded-xl p-8 bg-gray-50">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">경력증명서</h1>
                  <p className="text-gray-600">K-Xpert 글로벌 비즈니스 전문가 플랫폼</p>
                  <p className="text-sm text-gray-500 mt-4">발급일: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    검증된 경력 ({certificateType === 'comprehensive' ? verifiedCareers.length : selectedCareers.length}개)
                  </h3>
                  <div className="space-y-4">
                    {(certificateType === 'comprehensive' 
                      ? verifiedCareers 
                      : verifiedCareers.filter(career => selectedCareers.includes(career.id))
                    ).map((career) => (
                      <div key={career.id} className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900">{career.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {career.company} | {career.role} | {career.period}
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                          ✓ 검증 완료 ({career.verificationDate})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">QR 코드로 증명서 진위 확인</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">링크로 공유</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공유 링크
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value="https://k-xpert.com/share/preview-certificate"
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://k-xpert.com/share/preview-certificate');
                        alert('링크가 복사되었습니다!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      복사
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    이 링크로 증명서 미리보기를 공유할 수 있습니다.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const url = 'https://k-xpert.com/share/preview-certificate';
                      const text = 'K-Xpert 경력증명서를 확인해보세요!';
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                    }}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    트위터
                  </button>
                  <button
                    onClick={() => {
                      const url = 'https://k-xpert.com/share/preview-certificate';
                      const text = 'K-Xpert 경력증명서를 확인해보세요!';
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                    }}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    페이스북
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'K-Xpert 경력증명서',
                        text: '검증된 경력증명서를 확인해보세요!',
                        url: 'https://k-xpert.com/share/preview-certificate'
                      });
                    } else {
                      alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  네이티브 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateIssue;