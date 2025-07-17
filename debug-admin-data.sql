-- 관리자 대시보드 데이터 디버깅 및 확인
-- 현재 데이터 상태를 확인하고 문제점을 파악합니다

-- Step 1: 현재 데이터베이스 상태 확인
SELECT '=== 현재 데이터베이스 상태 ===' as info;

-- 사용자 데이터 확인
SELECT 
    'Users Table' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN account_type = 'individual' THEN 1 END) as individual_count,
    COUNT(CASE WHEN account_type = 'enterprise' THEN 1 END) as enterprise_count,
    COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN account_type = 'expert' THEN 1 END) as expert_count
FROM users;

-- 전문가 인증 데이터 확인
SELECT 
    'Expert Verifications Table' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
FROM expert_verifications;

-- 결제 데이터 확인
SELECT 
    'Payments Table' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
FROM payments;

-- 리뷰 요청 데이터 확인
SELECT 
    'Review Requests Table' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM review_requests;

-- Step 2: 상세 데이터 확인
SELECT '=== 상세 데이터 확인 ===' as info;

-- 사용자별 상세 정보
SELECT 
    'User Details' as info,
    id,
    email,
    name,
    account_type,
    verified,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 전문가 신청 상세 정보
SELECT 
    'Expert Applications Details' as info,
    ev.id,
    ev.status,
    ev.created_at,
    u.name,
    u.email
FROM expert_verifications ev
JOIN users u ON ev.user_id = u.id
ORDER BY ev.created_at DESC
LIMIT 10;

-- Step 3: RLS 정책 확인 (관리자 접근 권한)
SELECT 
    'RLS Policies Check' as info,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('expert_verifications', 'payments', 'review_requests', 'users')
ORDER BY tablename, policyname;