import React, { useState } from 'react';
import { Shield, Clock, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useReview } from '../hooks/useReview';

interface ReviewRequestButtonProps {
  careerId: string;
  careerTitle: string;
  onRequestCreated?: (requestId: string) => void;
}

const ReviewRequestButton: React.FC<ReviewRequestButtonProps> = ({
  careerId,
  careerTitle,
  onRequestCreated
}) => {
  const { createReviewRequest, loading } = useReview();
  const [showModal, setShowModal] = useState(false);
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const priorityOptions = {
    normal: { label: '일반', fee: 50000, days: '5-7일' },
    high: { label: '우선', fee: 75000, days: '3-5일' },
    urgent: { label: '긴급', fee: 100000, days: '1-2일' }
  };

  const handleRequestReview = async () => {
    try {
      setError('');
      const request = await createReviewRequest(careerId, { priority });
      setSuccess(true);
      onRequestCreated?.(request.id);
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || '검토 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <Shield className="h-4 w-4 mr-2" />
        전문가 검토 요청
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              {success ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">검토 요청 완료!</h3>
                  <p className="text-gray-600">
                    전문가 검토 요청이 성공적으로 등록되었습니다.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">전문가 검토 요청</h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">검토 대상</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{careerTitle}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">검토 우선순위</h4>
                    <div className="space-y-3">
                      {Object.entries(priorityOptions).map(([key, option]) => (
                        <label
                          key={key}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            priority === key
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="priority"
                              value={key}
                              checked={priority === key}
                              onChange={(e) => setPriority(e.target.value as any)}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-gray-500">예상 완료: {option.days}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {option.fee.toLocaleString()}원
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>전문가 검토 서비스</strong>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                          <li>업계 전문가가 직접 검토</li>
                          <li>정확하고 신뢰할 수 있는 검증</li>
                          <li>상세한 피드백과 개선 제안</li>
                          <li>검증 완료 시 공식 인증 부여</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div className="text-red-700 text-sm">{error}</div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleRequestReview}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                      {loading ? '요청 중...' : `${priorityOptions[priority].fee.toLocaleString()}원 결제`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewRequestButton;