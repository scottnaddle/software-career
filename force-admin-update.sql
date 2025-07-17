-- Force update admin accounts in users table
-- This will immediately fix the admin account issue

-- Update admin@k-xpert.co.kr
UPDATE users 
SET 
    account_type = 'admin',
    verified = true,
    name = 'K-Xpert 관리자',
    company = 'K-Xpert',
    position = '시스템 관리자',
    updated_at = NOW()
WHERE email = 'admin@k-xpert.co.kr';

-- Update admin@x-pert.co.kr  
UPDATE users 
SET 
    account_type = 'admin',
    verified = true,
    name = 'X-pert 관리자',
    company = 'X-pert',
    position = '시스템 관리자',
    updated_at = NOW()
WHERE email = 'admin@x-pert.co.kr';

-- Check results
SELECT 
    'After Update' as status,
    email,
    account_type,
    verified,
    name,
    company
FROM users 
WHERE email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr')
ORDER BY email;