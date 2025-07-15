import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one for OAuth users
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  name: data.session.user.user_metadata?.full_name || 
                        data.session.user.user_metadata?.name || 
                        data.session.user.email?.split('@')[0] || '',
                  account_type: 'individual',
                  phone: data.session.user.user_metadata?.phone || '',
                  company: data.session.user.user_metadata?.company || '',
                  position: data.session.user.user_metadata?.position || '',
                },
              ]);

            if (insertError) {
              console.error('Error creating OAuth user profile:', insertError);
            }
          }

          // Redirect to dashboard or intended page
          const redirectTo = localStorage.getItem('auth_redirect_to') || '/career-search';
          localStorage.removeItem('auth_redirect_to');
          navigate(redirectTo);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default AuthCallback;