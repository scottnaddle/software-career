import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { usePayment, PaymentRequest } from '../hooks/usePayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentRequest;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onError,
}) => {
  const { requestPayment, isProcessing } = usePayment();
  const [selectedMethod, setSelectedMethod] = useState<'toss' | 'inicis' | 'kakao'>('toss');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: 'toss' as const,
      name: '토스페이먼츠',
      description: '간편하고 안전한 결제',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      popular: true,
    },
    {
      id: 'inicis' as const,
      name: 'KG이니시스',
      description: '신용카드, 계좌이체, 가상계좌',
      icon: <Wallet className="h-6 w-6" />,
      color: 'bg-green-50 border-green-200 text-green-700',
      popular: false,
    },
    {
      id: 'kakao' as const,
      name: '카카오페이',
      description: '카카오톡으로 간편 결제',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      popular: false,
    },
  ];

  const handlePayment = async () => {
    setError('');
    
    try {
      const result = await requestPayment(selectedMethod, paymentData);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        setError(result.error || '결제 요청에 실패했습니다.');
        onError?.(result.error || '결제 요청에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '결제 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">결제 방법 선택</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{paymentData.orderName}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatAmount(paymentData.amount)}
              </span>
            </div>
            {paymentData.verificationSpeed && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">처리 속도</span>
                <span className="text-sm text-blue-600">
                  {paymentData.verificationSpeed === 'express' ? '빠른 검토 (1-2일)' : '일반 검토 (5-7일)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Methods */}
        <div className="p-6 space-y-3">
          <h3 className="font-medium text-gray-900 mb-4">결제 수단을 선택해주세요</h3>
          
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 ${method.color}`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    {method.popular && (
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                        인기
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ml-4 ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <CheckCircle className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toss Payments Widget Container */}
        {selectedMethod === 'toss' && (
          <div className="px-6">
            <div id="payment-method" className="mb-4"></div>
          </div>
        )}

        {/* Payment Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                결제 처리 중...
              </>
            ) : (
              `${formatAmount(paymentData.amount)} 결제하기`
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>SSL 보안 결제</span>
            </div>
            <div className="mx-2">•</div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>PCI DSS 인증</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="px-6 pb-6 text-xs text-gray-500">
          <p>
            결제 진행 시{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              이용약관
            </a>
            {' '}및{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              개인정보처리방침
            </a>
            에 동의한 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;