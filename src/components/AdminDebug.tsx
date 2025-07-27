import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_EMAILS } from '../constants';

const AdminDebug: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  const isAdminByEmail = user?.email && ADMIN_EMAILS.includes(user.email);
  const isAdminByProfile = profile?.account_type === 'admin';
  const finalIsAdmin = isAdminByProfile || isAdminByEmail;

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 m-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-yellow-800">관리자 권한 디버그 정보</h3>
        <button
          onClick={refreshProfile}
          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          프로필 새로고침
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>현재 사용자:</strong>
          <ul className="ml-4 mt-1">
            <li>ID: {user?.id || 'null'}</li>
            <li>Email: {user?.email || 'null'}</li>
            <li>Email Confirmed: {user?.email_confirmed_at ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div>
          <strong>프로필 정보:</strong>
          <ul className="ml-4 mt-1">
            <li>Profile ID: {profile?.id || 'null'}</li>
            <li>Profile Email: {profile?.email || 'null'}</li>
            <li>Account Type: {profile?.account_type || 'null'}</li>
            <li>Name: {profile?.name || 'null'}</li>
            <li>Verified: {profile?.verified ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div>
          <strong>관리자 확인:</strong>
          <ul className="ml-4 mt-1">
            <li>Admin Emails: {JSON.stringify(ADMIN_EMAILS)}</li>
            <li>Is Admin by Email: {isAdminByEmail ? 'Yes' : 'No'}</li>
            <li>Is Admin by Profile: {isAdminByProfile ? 'Yes' : 'No'}</li>
            <li><strong>Final Is Admin: {finalIsAdmin ? 'Yes' : 'No'}</strong></li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-white rounded border">
          <strong>Raw Data:</strong>
          <pre className="text-xs mt-2 overflow-auto">
            User: {JSON.stringify(user, null, 2)}
          </pre>
          <pre className="text-xs mt-2 overflow-auto">
            Profile: {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;