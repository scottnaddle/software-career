import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase, User } from '../lib/supabase';
import { ADMIN_EMAILS, LOADING_TIMEOUT } from '../constants';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ data?: any; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ data?: any; error: AuthError | null }>;
  signInWithKakao: () => Promise<{ data?: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: any) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.log('Auth loading timeout - proceeding without authentication');
      }
      setLoading(false);
    }, LOADING_TIMEOUT); // 3 seconds timeout

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (import.meta.env.DEV) {
          console.log('Auth session retrieved:', !!session);
          if (error) console.log('Auth session error:', error);
        }

        clearTimeout(loadingTimeout);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);

          // After fetching profile, check if user should be admin and redirect accordingly
          setTimeout(() => {
            if (typeof window !== 'undefined' && profile) {
              const userEmail = session.user.email;
              const shouldBeAdmin = ADMIN_EMAILS.includes(userEmail || '');
              const isCurrentlyAdmin = profile.account_type === 'admin';

              console.log('Auth state change - User:', userEmail);
              console.log('Should be admin:', shouldBeAdmin);
              console.log('Is currently admin:', isCurrentlyAdmin);

              if (shouldBeAdmin && !isCurrentlyAdmin) {
                console.log('⚠️ User should be admin but profile is not admin - updating...');
                // Force admin status update
                setProfile(prev => prev ? { ...prev, account_type: 'admin', verified: true } : null);
              }

              // Auto-redirect based on user type after successful login
              if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
                console.log('User email confirmed, redirecting...');

                const accountType = shouldBeAdmin ? 'admin' : (profile?.account_type || 'individual');
                console.log('Redirecting based on account type:', accountType);

                if (accountType === 'admin') {
                  window.location.href = '/admin-dashboard';
                } else {
                  window.location.href = '/career-search';
                }
              }
            }
          }, 200); // Increased delay to ensure profile is loaded
        } else {
          // Handle SIGNED_OUT event
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing profile');
            setProfile(null);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile fetch error:', error);
        
        if (error.code === 'PGRST116') { // Not found error
          console.log('Profile not found, attempting to create from auth metadata');
          
          // Try to get user metadata from auth
          const { data: authUser } = await supabase.auth.getUser();
          
          if (authUser.user && authUser.user.id === userId) {
            const metadata = authUser.user.user_metadata;
            const email = authUser.user.email;
            
            console.log('Auth user metadata:', metadata);
            
            // Create profile from auth metadata
            const profileData = {
              id: userId,
              email: email || '',
              name: metadata.name || email?.split('@')[0] || 'User',
              phone: metadata.phone || null,
              account_type: ADMIN_EMAILS.includes(email || '') ? 'admin' : (metadata.account_type || 'individual'),
              company: metadata.company || null,
              position: metadata.position || null,
              verified: ADMIN_EMAILS.includes(email || '') ? true : false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            console.log('Creating missing profile:', profileData);

            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert([profileData])
              .select()
              .single();

            if (createError) {
              console.error('Error creating missing profile:', createError);
              setProfile(null);
            } else {
              console.log('Missing profile created successfully:', newProfile);
              setProfile(newProfile);
            }
          } else {
            setProfile(null);
          }
        } else {
          console.error('Other profile fetch error:', error);
          setProfile(null);
        }
      } else {
        console.log('Profile found:', data);
        
        // Check if this is an admin user and needs account_type update
        const userEmail = data.email;
        const shouldBeAdmin = ADMIN_EMAILS.includes(userEmail || '');
        const isCurrentlyAdmin = data.account_type === 'admin';

        console.log('=== PROFILE ANALYSIS ===');
        console.log('User email:', userEmail);
        console.log('Should be admin:', shouldBeAdmin);
        console.log('Is currently admin:', isCurrentlyAdmin);
        console.log('Current account_type:', data.account_type);

        if (shouldBeAdmin && !isCurrentlyAdmin) {
          console.log('🔧 Updating admin account_type for:', userEmail);

          try {
            // Update in database
            const { data: updatedData, error: updateError } = await supabase
              .from('users')
              .update({
                account_type: 'admin',
                verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.id)
              .select()
              .single();

            if (updateError) {
              console.error('❌ Failed to update admin account_type:', updateError);
              // Set profile anyway with admin flag for immediate access
              const adminProfile = { ...data, account_type: 'admin', verified: true };
              setProfile(adminProfile);
              console.log('⚠️ Using local admin profile due to DB error');
              console.log('Final admin profile:', adminProfile);
            } else {
              console.log('✅ Successfully updated admin account_type');
              console.log('Updated profile:', updatedData);
              setProfile(updatedData);
            }
          } catch (updateErr) {
            console.error('❌ Error during admin update:', updateErr);
            // Set profile anyway with admin flag for immediate access
            const adminProfile = { ...data, account_type: 'admin', verified: true };
            setProfile(adminProfile);
            console.log('⚠️ Using local admin profile due to exception');
            console.log('Final admin profile:', adminProfile);
          }
        } else {
          setProfile(data);
          // Double-check admin status even if already admin
          if (shouldBeAdmin && isCurrentlyAdmin) {
            console.log('✅ Admin account confirmed for:', userEmail);
          }
        }

        console.log('=== FINAL PROFILE STATE ===');
        console.log('Profile set to:', data);
        console.log('Profile account_type:', data?.account_type);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== SIGN IN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Is admin email:', ADMIN_EMAILS.includes(email));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user && !error) {
        console.log('Sign in successful for:', data.user.email);

        // Force immediate profile fetch after successful sign in
        setTimeout(async () => {
          console.log('Fetching profile after sign in...');
          await fetchProfile(data.user.id);
        }, 500);
      }

      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            account_type: userData.accountType,
            company: userData.company,
            position: userData.position,
          }
        }
      });

      console.log('Auth signup result:', { data, error });

      if (error) {
        console.error('Auth signup error:', error);
        return { data, error };
      }

      if (data.user) {
        console.log('User created in auth.users:', data.user.id);
        
        // Create user profile in users table
        const profileData = {
          id: data.user.id,
          email,
          name: userData.name,
          phone: userData.phone || null,
          account_type: userData.accountType,
          company: userData.company || null,
          position: userData.position || null,
          verified: userData.accountType === 'admin', // Admin accounts are immediately verified
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Creating profile with data:', profileData);

        const { data: profileResult, error: profileError } = await supabase
          .from('users')
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail the signup if profile creation fails
          // The user can still login and we can create the profile later
        } else {
          console.log('Profile created successfully:', profileResult);
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signInWithKakao = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');

      // Call Supabase signOut with scope 'global' to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.error('Supabase signOut error:', error);
      }

      // Clear local state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);

      console.log('SignOut completed successfully');
      return { error: null };
    } catch (error) {
      console.error('SignOut catch error:', error);

      // Clear local state even if there's an error
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);

      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: profileData
      });

      if (authError) throw authError;

      // Update profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh profile
      await refreshProfile();

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Make auth functions available globally for debugging
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    (window as any).authDebug = {
      user,
      profile,
      session,
      loading,
      refreshProfile,
      signOut,
      signIn
    };
  }

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };
}