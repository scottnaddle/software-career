-- K-Xpert Database Utility Scripts
-- 개발 및 테스트 중 유용한 SQL 쿼리들

-- =================
-- 1. 데이터 확인 쿼리
-- =================

-- 전체 데이터 현황 요약
SELECT 
  'Summary' as section,
  'Users' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN account_type = 'individual' THEN 1 END) as individual,
  COUNT(CASE WHEN account_type = 'enterprise' THEN 1 END) as enterprise,
  COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin
FROM users
UNION ALL
SELECT 
  'Summary' as section,
  'Expert Profiles' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM expert_profiles
UNION ALL
SELECT 
  'Summary' as section,
  'Payments' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM payments
UNION ALL
SELECT 
  'Summary' as section,
  'Careers' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft
FROM careers;

-- 최신 사용자 활동 조회
SELECT 
  u.name,
  u.email,
  u.account_type,
  u.created_at,
  COUNT(DISTINCT c.id) as career_count,
  COUNT(DISTINCT p.id) as payment_count,
  COUNT(DISTINCT ep.id) as expert_profile_count
FROM users u
LEFT JOIN careers c ON u.id = c.user_id
LEFT JOIN payments p ON u.id = p.user_id
LEFT JOIN expert_profiles ep ON u.id = ep.user_id
WHERE u.account_type != 'admin'
GROUP BY u.id, u.name, u.email, u.account_type, u.created_at
ORDER BY u.created_at DESC
LIMIT 10;

-- 수익 및 결제 현황
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue,
  AVG(CASE WHEN status = 'completed' THEN amount END) as avg_amount
FROM payments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- =================
-- 2. 관리자 대시보드 테스트 데이터
-- =================

-- 관리자 대시보드 통계 확인
SELECT 
  'Dashboard Stats' as section,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN ep.status = 'pending' THEN ep.id END) as pending_experts,
  COUNT(DISTINCT CASE WHEN ep.status = 'approved' THEN ep.id END) as approved_experts,
  COUNT(DISTINCT CASE WHEN ep.status = 'rejected' THEN ep.id END) as rejected_experts,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as total_payments,
  COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) as pending_payments,
  COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.created_at >= DATE_TRUNC('month', NOW()) THEN p.amount ELSE 0 END), 0) as monthly_revenue,
  COUNT(DISTINCT CASE WHEN rr.status = 'in_progress' THEN rr.id END) as active_reviews
FROM users u
LEFT JOIN expert_profiles ep ON u.id = ep.user_id
LEFT JOIN payments p ON u.id = p.user_id
LEFT JOIN review_requests rr ON u.id = rr.user_id;

-- 승인 대기 전문가 목록
SELECT 
  ep.id,
  u.name,
  u.email,
  u.company,
  u.position,
  ep.specialization,
  ep.experience_years,
  ep.applied_at,
  ep.status
FROM expert_profiles ep
JOIN users u ON ep.user_id = u.id
WHERE ep.status = 'pending'
ORDER BY ep.applied_at DESC;

-- 최근 결제 내역 (관리자 대시보드용)
SELECT 
  p.id,
  u.name,
  u.email,
  p.amount,
  p.status,
  p.payment_method,
  p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- =================
-- 3. 데이터 정리 및 리셋 쿼리
-- =================

-- 테스트 데이터만 삭제 (관리자 계정 제외)
-- 주의: 실제 운영에서는 사용하지 마세요!
/*
DELETE FROM file_attachments WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM job_queue WHERE type IN ('email_notification', 'payment_processing');
DELETE FROM review_requests WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM certificates WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM careers WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM payments WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM expert_profiles WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM user_settings WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE account_type != 'admin');
DELETE FROM users WHERE account_type != 'admin';
*/

-- 특정 사용자 데이터 완전 삭제
-- REPLACE 'USER_EMAIL_HERE' with actual email
/*
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM users WHERE email = 'USER_EMAIL_HERE';
    
    IF target_user_id IS NOT NULL THEN
        DELETE FROM file_attachments WHERE user_id = target_user_id;
        DELETE FROM review_requests WHERE user_id = target_user_id OR expert_id IN (SELECT id FROM expert_profiles WHERE user_id = target_user_id);
        DELETE FROM certificates WHERE user_id = target_user_id;
        DELETE FROM careers WHERE user_id = target_user_id;
        DELETE FROM payments WHERE user_id = target_user_id;
        DELETE FROM expert_profiles WHERE user_id = target_user_id;
        DELETE FROM user_settings WHERE user_id = target_user_id;
        DELETE FROM user_roles WHERE user_id = target_user_id;
        DELETE FROM users WHERE id = target_user_id;
        
        RAISE NOTICE 'User % and all related data deleted successfully', 'USER_EMAIL_HERE';
    ELSE
        RAISE NOTICE 'User % not found', 'USER_EMAIL_HERE';
    END IF;
END $$;
*/

-- =================
-- 4. 성능 및 인덱스 확인
-- =================

-- 테이블 크기 확인
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename IN ('users', 'expert_profiles', 'payments', 'careers', 'certificates')
ORDER BY tablename, attname;

-- 인덱스 사용률 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =================
-- 5. 사용자 검증 및 수정 쿼리
-- =================

-- 이메일 중복 확인
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 프로필 없는 auth 사용자 찾기
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at,
  CASE WHEN u.id IS NULL THEN 'Missing Profile' ELSE 'Has Profile' END as profile_status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 누락된 사용자 설정 복구
INSERT INTO user_settings (user_id, email_notifications, push_notifications_enabled, language, timezone, theme, created_at, updated_at)
SELECT 
  id,
  true,
  false,
  'ko',
  'Asia/Seoul',
  'light',
  NOW(),
  NOW()
FROM users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- 누락된 사용자 역할 복구
INSERT INTO user_roles (user_id, role, granted_by, granted_at, is_active)
SELECT 
  id,
  CASE 
    WHEN account_type = 'admin' THEN 'admin'
    ELSE 'user'
  END,
  id,
  created_at,
  true
FROM users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT DO NOTHING;

-- =================
-- 6. 개발 테스트용 빠른 쿼리
-- =================

-- 빠른 사용자 생성 (테스트용)
INSERT INTO users (id, email, name, account_type, verified, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'test@example.com', 'Test User', 'individual', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- 빠른 결제 생성 (테스트용)
INSERT INTO payments (user_id, order_id, amount, provider, status, payment_method, created_at, updated_at)
SELECT 
  id,
  'TEST_ORDER_' || extract(epoch from now())::text,
  25000,
  'test',
  'completed',
  '테스트',
  NOW(),
  NOW()
FROM users
WHERE email = 'test@example.com'
LIMIT 1;

-- 현재 시스템 상태 한눈에 보기
SELECT 
  'System Status' as info,
  (SELECT COUNT(*) FROM users WHERE account_type != 'admin') as regular_users,
  (SELECT COUNT(*) FROM expert_profiles WHERE status = 'approved') as active_experts,
  (SELECT COUNT(*) FROM payments WHERE status = 'completed') as completed_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM review_requests WHERE status = 'in_progress') as active_reviews;

-- 메모리 사용량 및 연결 상태
SELECT 
  'Database Health' as info,
  (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
  (SELECT COUNT(*) FROM pg_stat_activity) as total_connections,
  pg_size_pretty(pg_database_size(current_database())) as database_size;

SELECT 'Mock data utilities loaded successfully!' as message;