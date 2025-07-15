import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Phone, ArrowLeft } from 'lucide-react';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const getErrorDescription = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제 과정에서 오류가 발생했습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했습니다.';
      case 'REJECT_ACCOUNT_PAYMENT':
        return '계좌 결제가 거절되었습니다.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 한도를 초과했습니다.';
      case 'EXCEED_MAX_PAYMENT_MONEY':
        return '결제 금액 한도를 초과했습니다.';
      case 'CARD_NOT_SUPPORTED':
        return '지원하지 않는 카드입니다.';
      case 'INVALID_CARD_EXPIRATION':
        return '유효하지 않은 카드 유효기간입니다.';
      case 'INVALID_STOPPED_CARD':
        return '정지된 카드입니다.';
      case 'SECURITY_AUTH_FAIL':
        return '보안 인증에 실패했습니다.';
      case 'INSUFFICIENT_BALANCE':
        return '잔액이 부족합니다.';
      default:
        return errorMessage || '알 수 없는 오류가 발생했습니다.';
    }
  };

  const getSolutionText = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '다시 결제를 진행해주세요.';
      case 'REJECT_CARD_COMPANY':
      case 'REJECT_ACCOUNT_PAYMENT':
        return '다른 결제 수단을 이용하거나 카드사/은행에 문의해주세요.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
      case 'EXCEED_MAX_PAYMENT_MONEY':
        return '내일 다시 시도하거나 다른 결제 수단을 이용해주세요.';
      case 'CARD_NOT_SUPPORTED':
        return '다른 카드나 결제 수단을 이용해주세요.';
      case 'INVALID_CARD_EXPIRATION':
      case 'INVALID_STOPPED_CARD':
        return '카드 정보를 확인하거나 다른 카드를 이용해주세요.';
      case 'INSUFFICIENT_BALANCE':
        return '계좌 잔액을 확인하거나 다른 결제 수단을 이용해주세요.';
      default:
        return '다시 시도하거나 고객센터에 문의해주세요.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">결제에 실패했습니다</h1>
            <p className="text-red-100">
              결제 처리 중 문제가 발생했습니다.
            </p>
          </div>

          {/* Error Details */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">오류 정보</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="font-medium text-red-900 mb-2">오류 원인</h3>
                  <p className="text-red-700">{getErrorDescription(errorCode)}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium text-red-900 mb-2">해결 방법</h3>
                  <p className="text-red-700">{getSolutionText(errorCode)}</p>
                </div>

                {orderId && (
                  <div>
                    <h3 className="font-medium text-red-900 mb-2">주문번호</h3>
                    <p className="text-red-700 font-mono text-sm">{orderId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Common Solutions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">일반적인 해결 방법</h2>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">다른 결제 수단 시도</h3>
                    <p className="text-gray-600 text-sm">
                      다른 카드나 계좌이체, 간편결제를 이용해보세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">카드 한도 확인</h3>
                    <p className="text-gray-600 text-sm">
                      결제 한도나 잔액을 확인해주세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">브라우저 새로고침</h3>
                    <p className="text-gray-600 text-sm">
                      브라우저를 새로고침하고 다시 시도해보세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">카드사/은행 문의</h3>
                    <p className="text-gray-600 text-sm">
                      카드사나 은행에서 결제를 차단했을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/career-registration')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                다시 결제하기
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                이전 페이지로
              </button>
            </div>

            {/* Support */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">고객센터 안내</h3>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                계속해서 결제에 문제가 발생하는 경우 고객센터로 문의해주세요.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">전화번호:</span>
                  <span className="text-blue-900 font-medium">1588-1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">운영시간:</span>
                  <span className="text-blue-900">평일 09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">이메일:</span>
                  <span className="text-blue-900">support@k-xpert.co.kr</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/contact')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                온라인 문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;