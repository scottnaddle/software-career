import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // In development mode, allow access without authentication after a short delay
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  if (loading && !isDevMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user && !isDevMode) {
    // Store the attempted location to redirect after login
    localStorage.setItem('auth_redirect_to', location.pathname);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // User is already logged in, redirect to dashboard
    return <Navigate to="/career-search" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;