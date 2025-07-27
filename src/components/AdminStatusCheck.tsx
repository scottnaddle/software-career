import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminStatusCheck: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      // Check current auth session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(`Session error: ${sessionError.message}`);
        return;
      }
      
      console.log('Current session:', session);
      
      // Check users table for admin@k-xpert.co.kr
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@k-xpert.co.kr');
        
      if (usersError) {
        setError(`Users query error: ${usersError.message}`);
        return;
      }
      
      console.log('Admin user data:', users);
      
      setAdminData({
        session,
        users,
        currentUser: session?.session?.user
      });
      
    } catch (err) {
      console.error('Admin status check error:', err);
      setError(`Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 m-4">
        <h3 className="text-lg font-semibold text-yellow-800">관리자 상태 확인 중...</h3>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 m-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-blue-800">관리자 계정 데이터베이스 상태</h3>
        <button
          onClick={checkAdminStatus}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          다시 확인
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 rounded p-3 mb-3">
          <p className="text-red-800 text-sm">에러: {error}</p>
        </div>
      )}
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>현재 세션:</strong>
          <pre className="text-xs mt-1 overflow-auto bg-white p-2 rounded border">
            {JSON.stringify(adminData?.session?.session?.user, null, 2)}
          </pre>
        </div>

        <div>
          <strong>admin@k-xpert.co.kr 데이터베이스 레코드:</strong>
          <pre className="text-xs mt-1 overflow-auto bg-white p-2 rounded border">
            {JSON.stringify(adminData?.users, null, 2)}
          </pre>
        </div>

        <div>
          <strong>발견된 문제:</strong>
          <ul className="ml-4 mt-1 text-sm">
            {!adminData?.session?.session ? (
              <li className="text-red-600">❌ 활성 세션 없음</li>
            ) : (
              <li className="text-green-600">✅ 활성 세션 존재</li>
            )}
            
            {adminData?.users?.length === 0 ? (
              <li className="text-red-600">❌ admin@k-xpert.co.kr 사용자 레코드 없음</li>
            ) : adminData?.users?.length > 0 ? (
              <li className="text-green-600">✅ admin@k-xpert.co.kr 사용자 레코드 존재</li>
            ) : (
              <li className="text-yellow-600">⚠️ 사용자 레코드 상태 불명</li>
            )}
            
            {adminData?.users?.[0]?.account_type !== 'admin' ? (
              <li className="text-red-600">❌ 계정 타입이 'admin'이 아님: {adminData?.users?.[0]?.account_type || 'null'}</li>
            ) : (
              <li className="text-green-600">✅ 계정 타입이 'admin'임</li>
            )}
            
            {adminData?.session?.session?.user?.email !== 'admin@k-xpert.co.kr' ? (
              <li className="text-red-600">❌ 세션 이메일이 admin@k-xpert.co.kr이 아님: {adminData?.session?.session?.user?.email || 'null'}</li>
            ) : (
              <li className="text-green-600">✅ 세션 이메일이 admin@k-xpert.co.kr임</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminStatusCheck;