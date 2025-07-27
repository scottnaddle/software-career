import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

interface ExpertApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  rate: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ExpertManagementProps {
  applications: ExpertApplication[];
  onAction: (id: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
  pendingActionId: string | null;
}

const ExpertManagement: React.FC<ExpertManagementProps> = ({
  applications,
  onAction,
  pendingActionId,
}) => {
  const [selectedApplication, setSelectedApplication] = useState<ExpertApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const filteredApplications = applications.filter(app => app.status === activeTab);

  const handleReject = async (application: ExpertApplication) => {
    setSelectedApplication(application);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (selectedApplication) {
      await onAction(selectedApplication.id, 'reject', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApplication(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    const statusLabels = {
      pending: '대기중',
      approved: '승인됨',
      rejected: '거절됨',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">전문가 신청 관리</h2>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(['pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'pending' && '대기중'}
                {tab === 'approved' && '승인됨'}
                {tab === 'rejected' && '거절됨'}
                <span className="ml-2 text-xs text-gray-400">
                  ({applications.filter(app => app.status === tab).length})
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'pending' && '대기 중인 신청이 없습니다.'}
              {activeTab === 'approved' && '승인된 신청이 없습니다.'}
              {activeTab === 'rejected' && '거절된 신청이 없습니다.'}
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{application.name}</h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">이메일: {application.email}</p>
                    <p className="text-sm text-gray-600 mb-1">전화: {application.phone}</p>
                    <p className="text-sm text-gray-600 mb-2">시급: {application.rate.toLocaleString()}원</p>
                    <p className="text-sm text-gray-700 mb-2">{application.bio}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {application.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      신청일: {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {activeTab === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => onAction(application.id, 'approve')}
                        disabled={pendingActionId === application.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        승인
                      </button>
                      <button
                        onClick={() => handleReject(application)}
                        disabled={pendingActionId === application.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        거절
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">거절 사유</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="거절 사유를 입력해주세요..."
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  거절
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertManagement;