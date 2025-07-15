-- Create Admin Account Migration
-- This migration creates a default admin account for the K-Xpert platform

-- Insert admin user data into users table
INSERT INTO users (
    id, 
    email, 
    name, 
    phone, 
    account_type, 
    company, 
    position, 
    verified,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@k-xpert.co.kr',
    'K-Xpert 관리자',
    '02-1234-5678',
    'admin',
    'K-Xpert',
    '시스템 관리자',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert admin role into user_roles table
INSERT INTO user_roles (
    user_id,
    role,
    granted_by,
    granted_at,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin',
    '00000000-0000-0000-0000-000000000001'::uuid, -- self-granted
    NOW(),
    true
) ON CONFLICT DO NOTHING;

-- Insert admin user settings
INSERT INTO user_settings (
    user_id,
    email_notifications,
    push_notifications_enabled,
    language,
    timezone,
    theme,
    notification_preferences,
    privacy_settings
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
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
) ON CONFLICT (user_id) DO NOTHING;

-- Create a function to set admin account password
-- This function should be called after the auth.users record is created
CREATE OR REPLACE FUNCTION set_admin_password()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function can be used to set the admin password
    -- The actual password setting should be done through Supabase Auth API
    -- or the Supabase dashboard
    
    -- Log the admin account creation
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        changes,
        ip_address,
        user_agent
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'CREATE',
        'users',
        '00000000-0000-0000-0000-000000000001'::uuid,
        '{"account_type": "admin", "role": "admin"}'::jsonb,
        '127.0.0.1',
        'System Migration'
    );
    
    RAISE NOTICE 'Admin account created successfully. Please set password through Supabase Auth.';
END;
$$;

-- Execute the function
SELECT set_admin_password();

-- Grant necessary permissions
-- Update RLS policies to allow admin access
CREATE POLICY IF NOT EXISTS "Admin full access to users" ON users
    FOR ALL USING (
        auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY IF NOT EXISTS "Admin full access to expert_profiles" ON expert_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY IF NOT EXISTS "Admin full access to payments" ON payments
    FOR ALL USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

CREATE POLICY IF NOT EXISTS "Admin full access to review_requests" ON review_requests
    FOR ALL USING (
        auth.uid() = user_id 
        OR auth.uid() = expert_id
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Add admin notification about account creation
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    data
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'K-Xpert 관리자 계정 생성됨',
    'K-Xpert 시스템 관리자 계정이 성공적으로 생성되었습니다. 관리자 대시보드에서 시스템을 관리할 수 있습니다.',
    'system',
    'high',
    '{
        "account_type": "admin",
        "created_at": "' || NOW() || '",
        "initial_setup": true
    }'::jsonb
) ON CONFLICT DO NOTHING;

-- Add system settings for admin
INSERT INTO system_settings (key, value, description, is_public) VALUES
    ('admin_email', '"admin@k-xpert.co.kr"', 'Default admin email address', false),
    ('admin_created_at', '"' || NOW() || '"', 'Admin account creation timestamp', false),
    ('platform_initialized', 'true', 'Platform initialization status', false)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Admin account created with the following details:';
    RAISE NOTICE '  Email: admin@k-xpert.co.kr';
    RAISE NOTICE '  User ID: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE '  Role: admin';
    RAISE NOTICE '  Account Type: admin';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: You need to set the password through one of these methods:';
    RAISE NOTICE '1. Supabase Dashboard -> Authentication -> Users -> Invite user';
    RAISE NOTICE '2. Use Supabase Auth API to create auth.users record';
    RAISE NOTICE '3. Use the password reset function';
    RAISE NOTICE '';
    RAISE NOTICE 'After setting the password, the admin can login at /login and access /admin-dashboard';
END;
$$;