import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Award, Shield, CheckCircle, AlertCircle, Loader2, User, Building } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithKakao, user, loading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'general' | 'admin' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    // Handle URL error parameters
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'auth_callback_failed':
          setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
          break;
        case 'unexpected_error':
          setError('예상치 못한 오류가 발생했습니다.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다.');
      }
    }

    // Redirect if already logged in
    if (user && !loading) {
      // Will be handled by the auth success handler
    }
  }, [user, loading, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        switch (error.message) {
          case 'Invalid login credentials':
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            break;
          case 'Email not confirmed':
            setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
            break;
          default:
            setError(error.message || '로그인에 실패했습니다.');
        }
      } else {
        // Redirect will be handled by useAuth hook
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'general' | 'admin') => {
    setIsLoading(true);
    setError('');
    
    const credentials = {
      general: { email: 'test@example.com', password: 'password123' },
      admin: { email: 'admin@k-xpert.co.kr', password: 'AdminK-Xpert2024!' }
    };

    try {
      const { error } = await signIn(credentials[userType].email, credentials[userType].password);
      
      if (error) {
        console.error(`${userType} login error:`, error);
        setError(`${userType === 'admin' ? '관리자' : '일반 사용자'} 로그인에 실패했습니다: ${error.message}`);
      }
    } catch (err) {
      console.error('Login catch error:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    localStorage.setItem('auth_redirect_to', '/career-search');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('구글 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('구글 로그인 중 오류가 발생했습니다.');
    }
  };

  const handleKakaoLogin = async () => {
    setError('');
    localStorage.setItem('auth_redirect_to', '/career-search');
    
    try {
      const { error } = await signInWithKakao();
      if (error) {
        setError('카카오 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('카카오 로그인 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">K-Xpert 로그인</h2>
          <p className="text-gray-600">
            전문 경력 검증 플랫폼에 오신 것을 환영합니다
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* General User Login */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">일반 사용자</h3>
              <p className="text-gray-600 text-sm">
                경력 등록, 검증 요청, 증명서 발급 등<br />
                개인 및 기업 사용자를 위한 서비스
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>경력 등록 및 관리</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>전문가 검증 요청</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>공식 증명서 발급</span>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('general')}
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  로그인 중...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  일반 사용자 로그인
                </>
              )}
            </button>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                테스트 계정: test@example.com
              </p>
            </div>
          </div>

          {/* Admin User Login */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200 hover:border-red-300 transition-colors">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">관리자</h3>
              <p className="text-gray-600 text-sm">
                시스템 관리, 사용자 관리, 전문가 승인 등<br />
                플랫폼 운영을 위한 관리자 전용 서비스
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-red-500 mr-2" />
                <span>사용자 및 전문가 관리</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-red-500 mr-2" />
                <span>결제 및 매출 관리</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-red-500 mr-2" />
                <span>시스템 모니터링</span>
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  로그인 중...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  관리자 로그인
                </>
              )}
            </button>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                테스트 계정: admin@k-xpert.co.kr
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Custom Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">직접 로그인</h3>
            <p className="text-gray-600 text-sm">
              이메일과 비밀번호를 입력하여 로그인하세요
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <Link to="/auth/reset-password" className="text-blue-600 hover:text-blue-500 font-medium">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-3" />
              구글로 로그인
            </button>
            
            <button 
              type="button"
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-yellow-400 rounded mr-3 flex items-center justify-center">
                <span className="text-xs font-bold">K</span>
              </div>
              카카오로 로그인
            </button>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            K-Xpert 특별 혜택
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-gray-700 text-sm">정부 공인 경력관리 플랫폼</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-500 mr-3" />
              <span className="text-gray-700 text-sm">블록체인 기반 경력 검증</span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-3" />
              <span className="text-gray-700 text-sm">공식 경력증명서 발급</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;