-- admin@x-pert.co.kr 계정 삭제
-- admin@k-xpert.co.kr만 관리자 계정으로 유지

-- Step 1: admin@x-pert.co.kr 관련 데이터 확인
SELECT '=== admin@x-pert.co.kr 계정 확인 ===' as info;

SELECT 
    'User to be deleted' as category,
    id,
    email,
    name,
    account_type,
    created_at
FROM users 
WHERE email = 'admin@x-pert.co.kr';

-- Step 2: 관련 데이터 확인 (알림, 로그 등)
SELECT 
    'Related notifications' as category,
    COUNT(*) as count
FROM notifications 
WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@x-pert.co.kr');

-- Step 3: admin@x-pert.co.kr 계정 삭제
-- 관련 데이터도 함께 삭제
DELETE FROM notifications 
WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@x-pert.co.kr');

DELETE FROM users 
WHERE email = 'admin@x-pert.co.kr';

-- Step 4: 삭제 확인
SELECT '=== 삭제 완료 확인 ===' as info;

SELECT 
    'Remaining admin accounts' as category,
    id,
    email,
    name,
    account_type,
    created_at
FROM users 
WHERE account_type = 'admin' 
   OR email LIKE '%admin%'
ORDER BY email;

-- Step 5: admin@k-xpert.co.kr 계정 상태 확인
SELECT 
    'Final admin account status' as category,
    id,
    email,
    name,
    account_type,
    verified,
    created_at,
    updated_at
FROM users 
WHERE email = 'admin@k-xpert.co.kr';