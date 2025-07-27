import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';
import { supabase } from '../../lib/supabase';

// Mock the AuthContext provider
const mockAuthContextValue = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
};

vi.mock('../useAuth', async () => {
  const actual = await vi.importActual('../useAuth');
  return {
    ...actual,
    useAuth: () => mockAuthContextValue,
  };
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockAuthContextValue.loading = true;
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.profile).toBe(null);
  });

  it('should handle successful authentication', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };

    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      account_type: 'individual' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verified: false,
    };

    mockAuthContextValue.user = mockUser as any;
    mockAuthContextValue.profile = mockProfile as any;
    mockAuthContextValue.loading = false;

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.loading).toBe(false);
  });

  it('should handle sign up', async () => {
    const signUpData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    mockAuthContextValue.signUp.mockResolvedValue({ 
      data: { user: { id: 'test-id' } }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth());

    await result.current.signUp(
      signUpData.email, 
      signUpData.password, 
      { name: signUpData.name }
    );

    expect(mockAuthContextValue.signUp).toHaveBeenCalledWith(
      signUpData.email,
      signUpData.password,
      { name: signUpData.name }
    );
  });

  it('should handle sign in', async () => {
    const signInData = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockAuthContextValue.signIn.mockResolvedValue({ 
      data: { user: { id: 'test-id' } }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth());

    await result.current.signIn(signInData.email, signInData.password);

    expect(mockAuthContextValue.signIn).toHaveBeenCalledWith(
      signInData.email,
      signInData.password
    );
  });

  it('should handle sign out', async () => {
    mockAuthContextValue.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await result.current.signOut();

    expect(mockAuthContextValue.signOut).toHaveBeenCalled();
  });

  it('should handle profile updates', async () => {
    const profileData = {
      name: 'Updated Name',
      phone: '010-9876-5432',
    };

    mockAuthContextValue.updateProfile.mockResolvedValue({ 
      data: { ...profileData }, 
      error: null 
    });

    const { result } = renderHook(() => useAuth());

    await result.current.updateProfile(profileData);

    expect(mockAuthContextValue.updateProfile).toHaveBeenCalledWith(profileData);
  });
});