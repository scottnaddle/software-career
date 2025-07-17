-- 관리자 접근 권한 및 데이터 확인을 위한 디버깅 스크립트

-- Step 1: 현재 사용자 데이터 확인
SELECT '=== 사용자 데이터 현황 ===' as info;

SELECT 
    'User Count by Type' as category,
    account_type,
    COUNT(*) as count
FROM users 
GROUP BY account_type
ORDER BY account_type;

SELECT 
    'Admin Users' as category,
    id,
    email,
    name,
    account_type,
    created_at
FROM users 
WHERE account_type = 'admin'
ORDER BY created_at;

-- Step 2: 전문가 신청 데이터 확인  
SELECT '=== 전문가 신청 데이터 현황 ===' as info;

SELECT 
    'Expert Applications Count' as category,
    status,
    COUNT(*) as count
FROM expert_verifications
GROUP BY status
ORDER BY status;

SELECT 
    'Expert Applications Detail' as category,
    ev.id,
    ev.user_id,
    ev.status,
    u.name,
    u.email,
    ev.created_at
FROM expert_verifications ev
LEFT JOIN users u ON ev.user_id = u.id
ORDER BY ev.created_at DESC
LIMIT 10;

-- Step 3: 결제 데이터 확인
SELECT '=== 결제 데이터 현황 ===' as info;

SELECT 
    'Payment Count by Status' as category,
    status,
    COUNT(*) as count
FROM payments
GROUP BY status
ORDER BY status;

SELECT 
    'Payment Details' as category,
    p.id,
    p.user_id,
    p.amount,
    p.status,
    u.name,
    u.email,
    p.created_at
FROM payments p
LEFT JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 4: 리뷰 요청 데이터 확인
SELECT '=== 리뷰 요청 데이터 현황 ===' as info;

SELECT 
    'Review Request Count by Status' as category,
    status,
    COUNT(*) as count
FROM review_requests
GROUP BY status
ORDER BY status;

-- Step 5: RLS 정책 확인
SELECT '=== RLS 정책 확인 ===' as info;

SELECT 
    'RLS Policies' as category,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('expert_verifications', 'payments', 'review_requests', 'users')
ORDER BY tablename, policyname;

-- Step 6: 테이블 소유자 및 권한 확인  
SELECT '=== 테이블 권한 확인 ===' as info;

SELECT 
    'Table Permissions' as category,
    t.table_name,
    t.table_type,
    CASE WHEN rls.rlsowner IS NOT NULL THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_class rls ON rls.oid = c.oid AND rls.relrowsecurity = true
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('expert_verifications', 'payments', 'review_requests', 'users')
ORDER BY t.table_name;