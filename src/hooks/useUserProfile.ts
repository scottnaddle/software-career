import { useState, useEffect } from 'react';
import { supabase, User } from '../lib/supabase';
import { useAuth } from './useAuth';

interface ProfileFormData {
  name: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  skills?: string[];
  education?: string;
  experience_years?: number;
  industry?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  location?: string;
  avatar_url?: string;
  is_expert?: boolean;
  expert_specialties?: string[];
  expert_rate?: number;
  expert_bio?: string;
  expert_verification_status?: 'pending' | 'verified' | 'rejected';
}

interface ProfileUpdateData {
  name?: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  skills?: string[];
  education?: string;
  experience_years?: number;
  industry?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  location?: string;
  avatar_url?: string;
  is_expert?: boolean;
  expert_specialties?: string[];
  expert_rate?: number;
  expert_bio?: string;
  expert_verification_status?: 'pending' | 'verified' | 'rejected';
}

interface ProfileStatistics {
  totalCareers: number;
  verifiedCareers: number;
  pendingCareers: number;
  rejectedCareers: number;
  totalReviews?: number;
  averageRating?: number;
  completedReviews?: number;
  pendingReviews?: number;
}

export const useUserProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load profile statistics
  useEffect(() => {
    if (user?.id) {
      loadProfileStatistics();
    }
  }, [user?.id]);

  const loadProfileStatistics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get career statistics
      const { data: careerStats, error: careerError } = await supabase
        .from('careers')
        .select('status')
        .eq('user_id', user.id);

      if (careerError) throw careerError;

      const stats: ProfileStatistics = {
        totalCareers: careerStats?.length || 0,
        verifiedCareers: careerStats?.filter(c => c.status === 'verified').length || 0,
        pendingCareers: careerStats?.filter(c => c.status === 'pending').length || 0,
        rejectedCareers: careerStats?.filter(c => c.status === 'rejected').length || 0,
      };

      // If user is an expert, get review statistics
      if (profile?.is_expert) {
        const { data: reviewStats, error: reviewError } = await supabase
          .from('review_requests')
          .select('status, review_score')
          .eq('expert_id', user.id);

        if (!reviewError && reviewStats) {
          const completedReviews = reviewStats.filter(r => r.status === 'completed');
          const avgRating = completedReviews.length > 0 
            ? completedReviews.reduce((sum, r) => sum + (r.review_score || 0), 0) / completedReviews.length
            : 0;

          stats.totalReviews = reviewStats.length;
          stats.completedReviews = completedReviews.length;
          stats.pendingReviews = reviewStats.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
          stats.averageRating = avgRating;
        }
      }

      setStatistics(stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileUpdateData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };

      // Update profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          company: profileData.company,
          position: profileData.position
        }
      });

      if (authError) throw authError;

      // Refresh profile data
      await refreshProfile();

      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setSaving(true);
    setError(null);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return { success: true, avatarUrl: publicUrl };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const deleteAvatar = async () => {
    if (!user?.id || !profile?.avatar_url) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Extract filename from URL
      const url = new URL(profile.avatar_url);
      const fileName = url.pathname.split('/').pop();

      if (fileName) {
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) throw deleteError;
      }

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: null });

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const requestExpertVerification = async (expertData: {
    specialties: string[];
    rate: number;
    bio: string;
    portfolio_url?: string;
    linkedin_url?: string;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setSaving(true);
    setError(null);

    try {
      // Update profile with expert information
      await updateProfile({
        is_expert: true,
        expert_specialties: expertData.specialties,
        expert_rate: expertData.rate,
        expert_bio: expertData.bio,
        expert_verification_status: 'pending',
        portfolio_url: expertData.portfolio_url,
        linkedin_url: expertData.linkedin_url
      });

      // Create expert verification request
      const { error: verificationError } = await supabase
        .from('expert_verifications')
        .insert([{
          user_id: user.id,
          specialties: expertData.specialties,
          rate: expertData.rate,
          bio: expertData.bio,
          portfolio_url: expertData.portfolio_url,
          linkedin_url: expertData.linkedin_url,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }]);

      if (verificationError) throw verificationError;

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setSaving(true);
    setError(null);

    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (signInError) throw new Error('Current password is incorrect');

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setSaving(true);
    setError(null);

    try {
      // Verify password before deletion
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password
      });

      if (signInError) throw new Error('Password verification failed');

      // Delete user data (cascading deletes will handle related records)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Delete auth user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (authDeleteError) throw authDeleteError;

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;

    const fields = [
      profile.name,
      profile.phone,
      profile.company,
      profile.position,
      profile.bio,
      profile.skills && profile.skills.length > 0,
      profile.education,
      profile.experience_years,
      profile.industry,
      profile.location,
      profile.avatar_url
    ];

    const filledFields = fields.filter(field => field).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return {
    profile,
    statistics,
    loading,
    saving,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    requestExpertVerification,
    changePassword,
    deleteAccount,
    loadProfileStatistics,
    getProfileCompletionPercentage,
    setError
  };
};