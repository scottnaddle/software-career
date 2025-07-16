-- Fix Admin Account Configuration
-- This script ensures the admin account is properly configured

-- Step 1: Check current admin account status
SELECT 
    'Auth Users' as table_name,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM auth.users au 
WHERE au.email = 'admin@k-xpert.co.kr';

SELECT 
    'Users Table' as table_name,
    u.id,
    u.email,
    u.name,
    u.account_type,
    u.verified,
    u.created_at
FROM users u 
WHERE u.email = 'admin@k-xpert.co.kr';

-- Step 2: Check if admin auth user exists, if not we need to create it manually
-- Note: This needs to be done through Supabase Auth API or Dashboard
-- We'll prepare the users table record to match the auth user ID

-- Step 3: Create or update admin profile in users table
-- This uses the actual auth user ID if it exists
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
)
SELECT 
    au.id,
    'admin@k-xpert.co.kr',
    'K-Xpert 관리자',
    '02-1234-5678',
    'admin',
    'K-Xpert',
    '시스템 관리자',
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'admin@k-xpert.co.kr'
ON CONFLICT (id) DO UPDATE SET
    account_type = 'admin',
    verified = true,
    updated_at = NOW();

-- Step 4: Ensure admin role exists in user_roles table
INSERT INTO user_roles (
    user_id,
    role,
    granted_by,
    granted_at,
    is_active
)
SELECT 
    au.id,
    'admin',
    au.id,
    NOW(),
    true
FROM auth.users au
WHERE au.email = 'admin@k-xpert.co.kr'
ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    granted_at = NOW();

-- Step 5: Create admin user settings
INSERT INTO user_settings (
    user_id,
    email_notifications,
    push_notifications_enabled,
    language,
    timezone,
    theme,
    notification_preferences,
    privacy_settings
)
SELECT 
    au.id,
    true,
    true,
    'ko',
    'Asia/Seoul',
    'light',
    '{
        "expert_applications": true,
        "payment_updates": true,
        "system_alerts": true,
        "user_reports": true
    }'::jsonb,
    '{
        "show_email": false,
        "show_phone": false,
        "allow_contact": false
    }'::jsonb
FROM auth.users au
WHERE au.email = 'admin@k-xpert.co.kr'
ON CONFLICT (user_id) DO UPDATE SET
    email_notifications = true,
    push_notifications_enabled = true,
    updated_at = NOW();

-- Step 6: Add admin notification
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    data,
    created_at
)
SELECT 
    au.id,
    'K-Xpert 관리자 계정 구성 완료',
    '관리자 계정이 성공적으로 구성되었습니다. 관리자 대시보드에서 시스템을 관리할 수 있습니다.',
    'system',
    'high',
    '{
        "account_type": "admin",
        "setup_completed": true,
        "configured_at": "' || NOW() || '"
    }'::jsonb,
    NOW()
FROM auth.users au
WHERE au.email = 'admin@k-xpert.co.kr'
ON CONFLICT DO NOTHING;

-- Step 7: Verify the setup
SELECT 
    'Verification' as status,
    u.id,
    u.email,
    u.name,
    u.account_type,
    u.verified,
    CASE 
        WHEN ur.role = 'admin' THEN 'Admin role assigned'
        ELSE 'Missing admin role'
    END as role_status,
    CASE 
        WHEN us.user_id IS NOT NULL THEN 'Settings configured'
        ELSE 'Missing settings'
    END as settings_status
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'admin' AND ur.is_active = true
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE u.email = 'admin@k-xpert.co.kr';

-- Step 8: Update auth user metadata (if needed)
-- This needs to be done through Supabase Auth API, but we can prepare the data
SELECT 
    'Auth Metadata Update Needed' as note,
    'UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || ''{"account_type": "admin", "name": "K-Xpert 관리자"}''::jsonb WHERE email = ''admin@k-xpert.co.kr'';' as sql_command;

-- Step 9: Create function to ensure admin profile creation
CREATE OR REPLACE FUNCTION ensure_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_auth_id UUID;
BEGIN
    -- Get admin auth user ID
    SELECT id INTO admin_auth_id 
    FROM auth.users 
    WHERE email = 'admin@k-xpert.co.kr';
    
    IF admin_auth_id IS NOT NULL THEN
        -- Update user metadata
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || '{"account_type": "admin", "name": "K-Xpert 관리자"}'::jsonb
        WHERE id = admin_auth_id;
        
        -- Ensure profile exists
        INSERT INTO users (
            id, email, name, phone, account_type, company, position, verified, created_at, updated_at
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
            
        RAISE NOTICE 'Admin profile ensured for auth user: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'Admin auth user not found. Please create auth user first.';
    END IF;
END;
$$;

-- Execute the function
SELECT ensure_admin_profile();

-- Final verification query
SELECT 
    'Final Status' as check_type,
    CASE 
        WHEN auth_user.id IS NOT NULL THEN 'Auth user exists'
        ELSE 'Auth user missing'
    END as auth_status,
    CASE 
        WHEN profile.account_type = 'admin' THEN 'Admin profile correct'
        ELSE 'Admin profile incorrect'
    END as profile_status,
    CASE 
        WHEN role.role = 'admin' THEN 'Admin role assigned'
        ELSE 'Admin role missing'
    END as role_status
FROM auth.users auth_user
FULL OUTER JOIN users profile ON auth_user.id = profile.id
LEFT JOIN user_roles role ON profile.id = role.user_id AND role.role = 'admin' AND role.is_active = true
WHERE auth_user.email = 'admin@k-xpert.co.kr' OR profile.email = 'admin@k-xpert.co.kr';