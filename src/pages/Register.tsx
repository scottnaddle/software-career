import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Award, CheckCircle, User, Building, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    position: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      navigate('/career-search');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return false;
    }
    if (accountType === 'enterprise') {
      if (!formData.company.trim()) {
        setError('회사명을 입력해주세요.');
        return false;
      }
      if (!formData.position.trim()) {
        setError('직책을 입력해주세요.');
        return false;
      }
    }
    if (!formData.agreeTerms) {
      setError('이용약관에 동의해주세요.');
      return false;
    }
    if (!formData.agreePrivacy) {
      setError('개인정보처리방침에 동의해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        accountType,
        company: accountType === 'enterprise' ? formData.company : '',
        position: accountType === 'enterprise' ? formData.position : '',
      };

      const { error } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        switch (error.message) {
          case 'User already registered':
            setError('이미 등록된 이메일입니다.');
            break;
          case 'Password should be at least 6 characters':
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            break;
          default:
            setError(error.message || '회원가입에 실패했습니다.');
        }
      } else {
        setSuccess('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 인증해주세요.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
          <p className="text-gray-600">
            K-Xpert와 함께 전문적인 경력 관리를 시작하세요
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 유형 선택</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                accountType === 'individual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setAccountType('individual')}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">개인</h4>
                  <p className="text-sm text-gray-600">글로벌 비즈니스 전문가</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                경력 등록, 검증, 증명서 발급 등 개인 서비스를 이용하세요
              </p>
            </div>

            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                accountType === 'enterprise'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setAccountType('enterprise')}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">기업</h4>
                  <p className="text-sm text-gray-600">채용 담당자</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                경력 검증, 인재 검색, 채용 분석 등 기업 서비스를 이용하세요
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {accountType === 'individual' ? '이름' : '담당자명'} *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={accountType === 'individual' ? '이름을 입력하세요' : '담당자명을 입력하세요'}
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소 *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인 *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            {accountType === 'enterprise' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    회사명 *
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="회사명을 입력하세요"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    직책 *
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="직책을 입력하세요"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                />
                <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium text-red-500">[필수]</span> 이용약관에 동의합니다.{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    자세히 보기
                  </a>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="agreePrivacy"
                  name="agreePrivacy"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  checked={formData.agreePrivacy}
                  onChange={handleInputChange}
                />
                <label htmlFor="agreePrivacy" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium text-red-500">[필수]</span> 개인정보처리방침에 동의합니다.{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    자세히 보기
                  </a>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="agreeMarketing"
                  name="agreeMarketing"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  checked={formData.agreeMarketing}
                  onChange={handleInputChange}
                />
                <label htmlFor="agreeMarketing" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium text-gray-500">[선택]</span> 마케팅 정보 수신에 동의합니다.
                </label>
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
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            회원가입 혜택
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">전문적인 서비스</h4>
              <p className="text-sm text-gray-600">체계적인 경력 관리 서비스</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">공식 인증</h4>
              <p className="text-sm text-gray-600">정부 공인 경력증명서</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">전문 지원</h4>
              <p className="text-sm text-gray-600">24/7 고객지원 서비스</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;