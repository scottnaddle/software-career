-- Debug Users List for Admin Dashboard
-- This script helps diagnose why users are not showing in admin dashboard

-- Step 1: Check total users in auth.users
SELECT 
    'Auth Users Count' as check_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_count
FROM auth.users;

-- Step 2: Check users in users table
SELECT 
    'Users Table Count' as check_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN account_type = 'individual' THEN 1 END) as individual_count,
    COUNT(CASE WHEN account_type = 'enterprise' THEN 1 END) as enterprise_count
FROM users;

-- Step 3: Show all users in users table
SELECT 
    'All Users in users table' as list_type,
    id,
    email,
    name,
    account_type,
    verified,
    created_at
FROM users
ORDER BY created_at DESC;

-- Step 4: Check RLS policies on users table
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- Step 5: Check if there are auth users without profiles
SELECT 
    'Users without profiles' as check_type,
    au.id,
    au.email,
    au.created_at as auth_created,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- Step 6: Test admin access to users table
-- (This simulates what the admin dashboard does)
SELECT 
    'Admin Dashboard Query Test' as test_type,
    COUNT(*) as accessible_users
FROM users
WHERE 
    -- This simulates the RLS policy check
    auth.uid() = id OR
    EXISTS (
        SELECT 1 FROM users admin_user
        WHERE admin_user.id = auth.uid() 
        AND admin_user.account_type = 'admin'
    );

-- Step 7: Show current auth context
SELECT 
    'Current Auth Context' as context_type,
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_email,
    (SELECT account_type FROM users WHERE id = auth.uid()) as current_account_type;