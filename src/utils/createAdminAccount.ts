import { supabase } from '../lib/supabase';

// This is a utility script to create a new admin account
// Run this in the browser console when logged in as the new admin

export const createAdminAccount = async (email: string, name: string) => {
  try {
    console.log('Creating admin account for:', email);
    
    // First, get the current user (should be the newly registered admin)
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      throw new Error('No authenticated user found. Please login first.');
    }
    
    if (authUser.user.email !== email) {
      throw new Error(`Current user email (${authUser.user.email}) doesn't match target email (${email})`);
    }
    
    console.log('Current auth user:', authUser.user);
    
    // Check if user already exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking existing user: ${checkError.message}`);
    }
    
    if (existingUser) {
      console.log('User already exists, updating to admin:', existingUser);
      
      // Update existing user to admin
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          account_type: 'admin',
          verified: true,
          name: name,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.user.id)
        .select()
        .single();
      
      if (updateError) {
        throw new Error(`Error updating user to admin: ${updateError.message}`);
      }
      
      console.log('Successfully updated user to admin:', updatedUser);
      return updatedUser;
    } else {
      console.log('Creating new admin user record');
      
      // Create new admin user record
      const newAdminData = {
        id: authUser.user.id,
        email: email,
        name: name,
        account_type: 'admin',
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([newAdminData])
        .select()
        .single();
      
      if (createError) {
        throw new Error(`Error creating admin user: ${createError.message}`);
      }
      
      console.log('Successfully created new admin user:', newUser);
      return newUser;
    }
    
  } catch (error) {
    console.error('Failed to create admin account:', error);
    throw error;
  }
};

// Helper function to check admin status
export const checkAdminStatus = async () => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      console.log('No authenticated user');
      return null;
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    console.log('Current user auth data:', authUser.user);
    console.log('Current user profile:', profile);
    
    const isAdminByEmail = ['admin@k-xpert.co.kr', 'admin2@k-xpert.co.kr'].includes(authUser.user.email || '');
    const isAdminByProfile = profile?.account_type === 'admin';
    
    console.log('Admin checks:', {
      email: authUser.user.email,
      isAdminByEmail,
      isAdminByProfile,
      finalIsAdmin: isAdminByEmail || isAdminByProfile
    });
    
    return {
      authUser: authUser.user,
      profile,
      isAdminByEmail,
      isAdminByProfile,
      isAdmin: isAdminByEmail || isAdminByProfile
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return null;
  }
};

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).createAdminAccount = createAdminAccount;
  (window as any).checkAdminStatus = checkAdminStatus;
}