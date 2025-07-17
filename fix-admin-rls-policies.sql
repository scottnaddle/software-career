-- 관리자 접근 권한 문제 해결을 위한 RLS 정책 수정

-- Step 1: 현재 RLS 정책 확인 및 삭제 (필요시)
-- 기존 관리자 정책들을 삭제하고 새로 생성

-- Expert verifications 테이블 관리자 정책
DROP POLICY IF EXISTS "admin_all_expert_verifications" ON expert_verifications;
CREATE POLICY "admin_all_expert_verifications" ON expert_verifications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (users.account_type = 'admin' 
         OR users.email = 'admin@k-xpert.co.kr' 
         OR users.email = 'admin@x-pert.co.kr')
  )
);

-- Payments 테이블 관리자 정책
DROP POLICY IF EXISTS "admin_all_payments" ON payments;
CREATE POLICY "admin_all_payments" ON payments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (users.account_type = 'admin' 
         OR users.email = 'admin@k-xpert.co.kr' 
         OR users.email = 'admin@x-pert.co.kr')
  )
);

-- Review requests 테이블 관리자 정책
DROP POLICY IF EXISTS "admin_all_review_requests" ON review_requests;
CREATE POLICY "admin_all_review_requests" ON review_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (users.account_type = 'admin' 
         OR users.email = 'admin@k-xpert.co.kr' 
         OR users.email = 'admin@x-pert.co.kr')
  )
);

-- Users 테이블 관리자 정책
DROP POLICY IF EXISTS "admin_all_users" ON users;
CREATE POLICY "admin_all_users" ON users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users AS admin_user
    WHERE admin_user.id = auth.uid() 
    AND (admin_user.account_type = 'admin' 
         OR admin_user.email = 'admin@k-xpert.co.kr' 
         OR admin_user.email = 'admin@x-pert.co.kr')
  )
);

-- Notifications 테이블 관리자 정책 (있다면)
DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications" ON notifications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (users.account_type = 'admin' 
         OR users.email = 'admin@k-xpert.co.kr' 
         OR users.email = 'admin@x-pert.co.kr')
  )
);

-- Step 2: 관리자 계정의 account_type 확실히 설정
UPDATE users 
SET account_type = 'admin' 
WHERE email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr');

-- Step 3: 정책 적용 확인
SELECT '=== 업데이트된 RLS 정책 확인 ===' as info;

SELECT 
    'Updated RLS Policies' as category,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('expert_verifications', 'payments', 'review_requests', 'users', 'notifications')
  AND policyname LIKE 'admin_%'
ORDER BY tablename, policyname;

-- Step 4: 관리자 계정 확인
SELECT 
    'Admin Accounts' as category,
    id,
    email,
    name,
    account_type,
    created_at,
    updated_at
FROM users 
WHERE account_type = 'admin' 
   OR email IN ('admin@k-xpert.co.kr', 'admin@x-pert.co.kr')
ORDER BY email;