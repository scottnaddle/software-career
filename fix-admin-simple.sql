-- Simple Admin Account Fix (No user_roles table needed)
-- This script fixes admin accounts without requiring user_roles table

-- Step 1: Check current status
SELECT 
    'Current Status' as check_type,
    au.email,
    au.id as auth_id,
    u.account_type,
    u.verified,
    u.name
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr');

-- Step 2: Update/Create admin profiles
-- For admin@k-xpert.co.kr
DO $$
DECLARE
    admin_auth_id UUID;
BEGIN
    -- Check if admin@k-xpert.co.kr exists in auth.users
    SELECT id INTO admin_auth_id
    FROM auth.users
    WHERE email = 'admin@k-xpert.co.kr';
    
    IF admin_auth_id IS NOT NULL THEN
        -- Update auth user metadata
        UPDATE auth.users 
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            '{"account_type": "admin", "name": "K-Xpert 관리자"}'::jsonb
        WHERE id = admin_auth_id;
        
        -- Insert or update user profile
        INSERT INTO users (
            id, 
            email, 
            name, 
            phone, 
            account_type, 
            company, 
            position, 
            verified,
            created_at,
            updated_at
        ) VALUES (
            admin_auth_id,
            'admin@k-xpert.co.kr',
            'K-Xpert 관리자',
            '02-1234-5678',
            'admin',
            'K-Xpert',
            '시스템 관리자',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            account_type = 'admin',
            verified = true,
            name = 'K-Xpert 관리자',
            company = 'K-Xpert',
            position = '시스템 관리자',
            updated_at = NOW();
            
        RAISE NOTICE 'Admin profile updated for admin@k-xpert.co.kr with ID: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'admin@k-xpert.co.kr not found in auth.users. Please create the auth user first.';
    END IF;
END;
$$;

-- For admin@x-pert.co.kr
DO $$
DECLARE
    admin_auth_id UUID;
BEGIN
    -- Check if admin@x-pert.co.kr exists in auth.users
    SELECT id INTO admin_auth_id
    FROM auth.users
    WHERE email = 'admin@x-pert.co.kr';
    
    IF admin_auth_id IS NOT NULL THEN
        -- Update auth user metadata
        UPDATE auth.users 
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            '{"account_type": "admin", "name": "X-pert 관리자"}'::jsonb
        WHERE id = admin_auth_id;
        
        -- Insert or update user profile
        INSERT INTO users (
            id, 
            email, 
            name, 
            phone, 
            account_type, 
            company, 
            position, 
            verified,
            created_at,
            updated_at
        ) VALUES (
            admin_auth_id,
            'admin@x-pert.co.kr',
            'X-pert 관리자',
            '02-1234-5678',
            'admin',
            'X-pert',
            '시스템 관리자',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            account_type = 'admin',
            verified = true,
            name = 'X-pert 관리자',
            company = 'X-pert',
            position = '시스템 관리자',
            updated_at = NOW();
            
        RAISE NOTICE 'Admin profile updated for admin@x-pert.co.kr with ID: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'admin@x-pert.co.kr not found in auth.users. Please create the auth user first.';
    END IF;
END;
$$;

-- Step 3: Create debug function (without user_roles dependency)
CREATE OR REPLACE FUNCTION debug_admin_simple(login_email TEXT)
RETURNS TABLE (
    step TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    auth_user_id UUID;
    user_profile RECORD;
BEGIN
    -- Step 1: Check auth user
    SELECT id INTO auth_user_id FROM auth.users WHERE email = login_email;
    
    IF auth_user_id IS NULL THEN
        RETURN QUERY SELECT 'auth_user', 'MISSING', 'User not found in auth.users table';
        RETURN;
    ELSE
        RETURN QUERY SELECT 'auth_user', 'EXISTS', 'User ID: ' || auth_user_id::TEXT;
    END IF;
    
    -- Step 2: Check user profile
    SELECT * INTO user_profile FROM users WHERE id = auth_user_id;
    
    IF user_profile.id IS NULL THEN
        RETURN QUERY SELECT 'user_profile', 'MISSING', 'Profile not found in users table';
    ELSE
        RETURN QUERY SELECT 'user_profile', 'EXISTS', 'Account type: ' || COALESCE(user_profile.account_type, 'NULL');
    END IF;
    
    -- Step 3: Check if account_type is admin
    IF user_profile.account_type = 'admin' THEN
        RETURN QUERY SELECT 'account_type', 'CORRECT', 'Account type is admin';
    ELSE
        RETURN QUERY SELECT 'account_type', 'INCORRECT', 'Account type is: ' || COALESCE(user_profile.account_type, 'NULL');
    END IF;
    
    -- Step 4: Check verification status
    IF user_profile.verified THEN
        RETURN QUERY SELECT 'verification', 'VERIFIED', 'Account is verified';
    ELSE
        RETURN QUERY SELECT 'verification', 'NOT_VERIFIED', 'Account is not verified';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Run debug for both admin accounts
SELECT 'DEBUG admin@k-xpert.co.kr' as debug_session, * FROM debug_admin_simple('admin@k-xpert.co.kr');
SELECT 'DEBUG admin@x-pert.co.kr' as debug_session, * FROM debug_admin_simple('admin@x-pert.co.kr');

-- Step 5: Final verification
SELECT 
    'Final Verification' as check_type,
    u.email,
    u.account_type,
    u.verified,
    u.name,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr')
ORDER BY u.email;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION debug_admin_simple(TEXT) TO authenticated;