-- Create Test Users for Login System
-- 이 스크립트는 테스트 로그인을 위한 사용자들을 생성합니다.

-- 1. 일반 사용자 테스트 계정 생성
-- 먼저 Supabase Dashboard → Authentication → Users에서 다음 사용자를 생성하세요:
-- Email: test@example.com
-- Password: password123
-- 그 다음 아래 SQL을 실행하여 프로필을 생성하세요:

-- 테스트 사용자 프로필 생성 (users 테이블에 이미 있다면 업데이트)
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
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  '테스트 사용자',
  '010-1234-5678',
  'individual',
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  account_type = EXCLUDED.account_type,
  verified = EXCLUDED.verified,
  updated_at = NOW();

-- 2. 관리자 계정 확인 및 업데이트
-- 관리자 계정이 auth.users에 없다면 Supabase Dashboard에서 생성:
-- Email: admin@k-xpert.co.kr
-- Password: AdminK-Xpert2024!

-- 관리자 프로필 생성/업데이트
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
  (SELECT id FROM auth.users WHERE email = 'admin@k-xpert.co.kr'),
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
  name = EXCLUDED.name,
  account_type = EXCLUDED.account_type,
  verified = EXCLUDED.verified,
  updated_at = NOW();

-- 3. 사용자 역할 설정
INSERT INTO user_roles (user_id, role, granted_by, granted_at, is_active)
SELECT 
  id,
  CASE 
    WHEN account_type = 'admin' THEN 'admin'
    ELSE 'user'
  END,
  id,
  NOW(),
  true
FROM users
WHERE email IN ('test@example.com', 'admin@k-xpert.co.kr')
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  granted_at = NOW();

-- 4. 사용자 설정 생성
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
WHERE email IN ('test@example.com', 'admin@k-xpert.co.kr')
ON CONFLICT (user_id) DO UPDATE SET
  updated_at = NOW();

-- 5. 테스트 사용자용 샘플 경력 데이터 생성
INSERT INTO careers (
  user_id, 
  title, 
  company, 
  role, 
  description, 
  start_date, 
  end_date, 
  type, 
  technologies, 
  achievements, 
  status, 
  created_at, 
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'Senior Frontend Developer',
  'Tech Company',
  'Frontend Developer',
  'React 및 Vue.js를 활용한 웹 애플리케이션 개발 및 사용자 인터페이스 최적화 업무를 담당했습니다.',
  '2022-01-01',
  '2024-01-01',
  'experience',
  ARRAY['React', 'Vue.js', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
  ARRAY['사용자 만족도 95% 달성', '페이지 로딩 속도 40% 개선', '코드 리뷰 시스템 도입'],
  'draft',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 6. 확인 쿼리
SELECT 
  'Test Users Created' as status,
  u.email,
  u.name,
  u.account_type,
  u.verified,
  CASE WHEN au.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as auth_status
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email IN ('test@example.com', 'admin@k-xpert.co.kr')
ORDER BY u.account_type;

-- 성공 메시지
SELECT 
  'SUCCESS: Test users are ready for login!' as message,
  'test@example.com / password123' as general_user,
  'admin@k-xpert.co.kr / AdminK-Xpert2024!' as admin_user;