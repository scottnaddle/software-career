-- Fix Admin Account for admin@x-pert.co.kr
-- This script ensures both admin@k-xpert.co.kr and admin@x-pert.co.kr work as admin accounts

-- Step 1: Check if admin@x-pert.co.kr exists in auth.users
SELECT 
    'Auth Users Check' as check_type,
    email,
    id,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr');

-- Step 2: Check if admin@x-pert.co.kr exists in users table
SELECT 
    'Users Table Check' as check_type,
    email,
    id,
    account_type,
    verified,
    created_at
FROM users 
WHERE email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr');

-- Step 3: Create or update admin profile for admin@x-pert.co.kr
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
            updated_at = NOW();
            
        -- Insert admin role
        INSERT INTO user_roles (
            user_id,
            role,
            granted_by,
            granted_at,
            is_active
        ) VALUES (
            admin_auth_id,
            'admin',
            admin_auth_id,
            NOW(),
            true
        ) ON CONFLICT (user_id, role) DO UPDATE SET
            is_active = true,
            granted_at = NOW();
            
        RAISE NOTICE 'Admin profile created/updated for admin@x-pert.co.kr with ID: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'admin@x-pert.co.kr not found in auth.users. Please create the auth user first.';
    END IF;
END;
$$;

-- Step 4: Also ensure admin@k-xpert.co.kr is properly set up
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
            updated_at = NOW();
            
        -- Insert admin role
        INSERT INTO user_roles (
            user_id,
            role,
            granted_by,
            granted_at,
            is_active
        ) VALUES (
            admin_auth_id,
            'admin',
            admin_auth_id,
            NOW(),
            true
        ) ON CONFLICT (user_id, role) DO UPDATE SET
            is_active = true,
            granted_at = NOW();
            
        RAISE NOTICE 'Admin profile created/updated for admin@k-xpert.co.kr with ID: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'admin@k-xpert.co.kr not found in auth.users. Please create the auth user first.';
    END IF;
END;
$$;

-- Step 5: Create a function to check admin status
CREATE OR REPLACE FUNCTION check_admin_status(check_email TEXT)
RETURNS TABLE (
    email TEXT,
    auth_user_exists BOOLEAN,
    profile_exists BOOLEAN,
    account_type TEXT,
    verified BOOLEAN,
    has_admin_role BOOLEAN,
    auth_metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        check_email as email,
        (au.id IS NOT NULL) as auth_user_exists,
        (u.id IS NOT NULL) as profile_exists,
        COALESCE(u.account_type, 'none') as account_type,
        COALESCE(u.verified, false) as verified,
        (ur.role IS NOT NULL) as has_admin_role,
        au.raw_user_meta_data as auth_metadata
    FROM auth.users au
    FULL OUTER JOIN users u ON au.id = u.id
    LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'admin' AND ur.is_active = true
    WHERE au.email = check_email OR u.email = check_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Check both admin accounts
SELECT * FROM check_admin_status('admin@k-xpert.co.kr');
SELECT * FROM check_admin_status('admin@x-pert.co.kr');

-- Step 7: Create debug function to help troubleshoot admin login
CREATE OR REPLACE FUNCTION debug_admin_login(login_email TEXT)
RETURNS TABLE (
    step TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    auth_user_id UUID;
    user_profile RECORD;
    admin_role RECORD;
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
    
    -- Step 3: Check admin role
    SELECT * INTO admin_role FROM user_roles WHERE user_id = auth_user_id AND role = 'admin' AND is_active = true;
    
    IF admin_role.user_id IS NULL THEN
        RETURN QUERY SELECT 'admin_role', 'MISSING', 'Admin role not found or inactive';
    ELSE
        RETURN QUERY SELECT 'admin_role', 'EXISTS', 'Admin role active since: ' || admin_role.granted_at::TEXT;
    END IF;
    
    -- Step 4: Check if account_type is admin
    IF user_profile.account_type = 'admin' THEN
        RETURN QUERY SELECT 'account_type', 'CORRECT', 'Account type is admin';
    ELSE
        RETURN QUERY SELECT 'account_type', 'INCORRECT', 'Account type is: ' || COALESCE(user_profile.account_type, 'NULL');
    END IF;
    
    -- Step 5: Check verification status
    IF user_profile.verified THEN
        RETURN QUERY SELECT 'verification', 'VERIFIED', 'Account is verified';
    ELSE
        RETURN QUERY SELECT 'verification', 'NOT_VERIFIED', 'Account is not verified';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run debug for both admin accounts
SELECT 'DEBUG admin@k-xpert.co.kr' as debug_session, * FROM debug_admin_login('admin@k-xpert.co.kr');
SELECT 'DEBUG admin@x-pert.co.kr' as debug_session, * FROM debug_admin_login('admin@x-pert.co.kr');

-- Step 8: Final verification
SELECT 
    'Final Verification' as check_type,
    u.email,
    u.account_type,
    u.verified,
    ur.role as admin_role,
    ur.is_active as role_active,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'admin'
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr')
ORDER BY u.email;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_admin_status(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION debug_admin_login(TEXT) TO authenticated;