import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, FileText, Award, HelpCircle, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await signOut();
      setIsUserMenuOpen(false);
      
      // Clear any stored redirect paths
      localStorage.removeItem('auth_redirect_to');
      
      // Navigate to home page
      navigate('/');
      
      // Force page refresh to clear any remaining state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      localStorage.removeItem('auth_redirect_to');
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-blue-900 shadow-lg sticky top-0 z-50" style={{ backgroundColor: '#060097' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3">
                  <Award className="h-7 w-7 text-blue-900" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-white tracking-wide">K-Xpert</span>
                    {import.meta.env.VITE_DEV_MODE === 'true' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded">DEV</span>
                    )}
                  </div>
                  <div className="text-sm text-blue-100 mt-1">글로벌 비즈니스 전문가 플랫폼</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/career-registration" 
              className={`px-4 py-3 text-base font-medium transition-colors ${
                isActive('/career-registration') 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-blue-100 hover:text-white'
              }`}
              style={{ color: isActive('/career-registration') ? 'white' : 'rgba(242,245,247,0.76)' }}
            >
              경력 등록
            </Link>
            <Link 
              to="/career-search" 
              className={`px-4 py-3 text-base font-medium transition-colors ${
                isActive('/career-search') 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-blue-100 hover:text-white'
              }`}
              style={{ color: isActive('/career-search') ? 'white' : 'rgba(242,245,247,0.76)' }}
            >
              경력 조회
            </Link>
            <Link 
              to="/certificate-issue" 
              className={`px-4 py-3 text-base font-medium transition-colors ${
                isActive('/certificate-issue') 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-blue-100 hover:text-white'
              }`}
              style={{ color: isActive('/certificate-issue') ? 'white' : 'rgba(242,245,247,0.76)' }}
            >
              증명서 발급
            </Link>
            <Link 
              to="/enterprise" 
              className={`px-4 py-3 text-base font-medium transition-colors ${
                isActive('/enterprise') 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-blue-100 hover:text-white'
              }`}
              style={{ color: isActive('/enterprise') ? 'white' : 'rgba(242,245,247,0.76)' }}
            >
              기업 서비스
            </Link>
            <Link 
              to="/guide" 
              className={`flex items-center px-4 py-3 text-base font-medium transition-colors ${
                isActive('/guide') 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-blue-100 hover:text-white'
              }`}
              style={{ color: isActive('/guide') ? 'white' : 'rgba(242,245,247,0.76)' }}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              이용 안내
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationDropdown />
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 text-blue-100 hover:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-900" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {profile?.name || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-blue-100">
                      {profile?.account_type === 'admin' ? '관리자' : 
                       profile?.account_type === 'enterprise' ? '기업' : '개인'}
                      {profile?.account_type === 'admin' && (
                        <span className="ml-1 inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/career-search"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        내 경력 관리
                      </Link>
                      
                      <Link
                        to="/certificate-issue"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Award className="h-4 w-4 mr-3" />
                        증명서 발급
                      </Link>
                      
                      {profile?.account_type === 'admin' && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link
                            to="/admin-dashboard"
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-l-2 border-red-500 bg-red-25"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-3" />
                            관리자 대시보드
                            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ADMIN</span>
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-blue-100 hover:text-white px-4 py-2 rounded-lg text-base font-medium transition-colors border border-blue-300 hover:border-white"
                  style={{ color: 'rgba(242,245,247,0.76)' }}
                >
                  로그인
                </Link>
                <Link 
                  to="/register"
                  className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg text-base font-medium transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-blue-100 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" style={{ backgroundColor: '#060097' }}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-800">
              <Link 
                to="/career-registration" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/career-registration') 
                    ? 'text-white bg-blue-800' 
                    : 'text-blue-100 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                경력 등록
              </Link>
              <Link 
                to="/career-search" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/career-search') 
                    ? 'text-white bg-blue-800' 
                    : 'text-blue-100 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                경력 조회
              </Link>
              <Link 
                to="/certificate-issue" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/certificate-issue') 
                    ? 'text-white bg-blue-800' 
                    : 'text-blue-100 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                증명서 발급
              </Link>
              <Link 
                to="/enterprise" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/enterprise') 
                    ? 'text-white bg-blue-800' 
                    : 'text-blue-100 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                기업 서비스
              </Link>
              <Link 
                to="/guide" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/guide') 
                    ? 'text-white bg-blue-800' 
                    : 'text-blue-100 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                이용 안내
              </Link>
              <div className="border-t border-blue-800 pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-900" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {profile?.name || user.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-blue-100">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {profile?.account_type === 'admin' && (
                      <Link
                        to="/admin-dashboard"
                        className="flex items-center w-full text-left text-red-300 hover:text-red-200 px-3 py-2 rounded-md text-base font-medium border border-red-400 bg-red-900 bg-opacity-20 mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        관리자 대시보드
                        <span className="ml-auto text-xs bg-red-400 text-red-100 px-2 py-0.5 rounded-full">ADMIN</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left text-blue-100 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="block w-full text-left text-blue-100 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link 
                      to="/register"
                      className="block w-full bg-white text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;