import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, FileText, ArrowRight, Clock, X } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmPayment } = usePayment();
  
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState('');

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 누락되었습니다.');
        setIsConfirming(false);
        return;
      }

      try {
        const result = await confirmPayment(paymentKey, orderId, parseInt(amount));
        
        if (result.success) {
          setConfirmationResult(result);
        } else {
          setError(result.error || '결제 확인에 실패했습니다.');
        }
      } catch (err: any) {
        setError(err.message || '결제 확인 중 오류가 발생했습니다.');
      } finally {
        setIsConfirming(false);
      }
    };

    handlePaymentConfirmation();
  }, [paymentKey, orderId, amount, confirmPayment]);

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 확인 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">결제 확인 실패</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/career-registration')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                다시 시도하기
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                고객센터 문의
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">결제가 완료되었습니다!</h1>
            <p className="text-green-100">
              경력 검증 서비스 신청이 성공적으로 처리되었습니다.
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-mono text-sm">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 금액</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                    }).format(parseInt(amount || '0'))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 방법</span>
                  <span>토스페이먼츠</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 시간</span>
                  <span>{new Date().toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">다음 단계</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">전문가 검토 진행</h3>
                    <p className="text-gray-600 text-sm">
                      전문가가 제출하신 경력을 상세히 검토합니다.
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-blue-600 ml-auto" />
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">검토 결과 알림</h3>
                    <p className="text-gray-600 text-sm">
                      검토 완료 시 이메일로 결과를 알려드립니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">증명서 발급</h3>
                    <p className="text-gray-600 text-sm">
                      검증 완료 후 공식 경력증명서를 발급받으실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/career-search')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                내 경력 관리로 이동
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>

              <button
                onClick={() => window.print()}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                결제 영수증 출력
              </button>
            </div>

            {/* Support */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm mb-2">
                결제나 서비스 이용 중 문의사항이 있으시면
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                고객센터로 문의해주세요
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;