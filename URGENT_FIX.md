# 긴급 수정 - 일반 사용자 로그인 문제

## 문제 상황
- `test@example.com` 계정이 Supabase Auth에 존재하지 않음
- 자동 계정 생성 로직이 실행되지 않음
- 400 에러 발생 (Invalid login credentials)

## 즉시 해결 방법

### 1. Supabase Dashboard에서 계정 생성
1. https://app.supabase.com 접속
2. 프로젝트 선택
3. Authentication → Users 메뉴
4. "Add user" 클릭
5. 다음 정보 입력:
   - **Email**: `test@example.com`
   - **Password**: `password123`
   - **Auto Confirm User**: ✅ 체크
6. "Add user" 클릭

### 2. 관리자 계정도 동일하게 생성
- **Email**: `admin@k-xpert.co.kr`
- **Password**: `AdminK-Xpert2024!`

### 3. SQL 스크립트 실행
Supabase → SQL Editor에서 다음 실행:

```sql
-- 테스트 사용자 프로필 생성
INSERT INTO users (
  id, 
  email, 
  name, 
  phone, 
  account_type, 
  verified, 
  created_at, 
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  '테스트 사용자',
  '010-1234-5678',
  'individual',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  account_type = EXCLUDED.account_type,
  verified = EXCLUDED.verified,
  updated_at = NOW();

-- 관리자 프로필 생성
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
  company = EXCLUDED.company,
  position = EXCLUDED.position,
  verified = EXCLUDED.verified,
  updated_at = NOW();
```

### 4. 확인 쿼리
```sql
SELECT 
  au.email,
  au.created_at as auth_created,
  au.email_confirmed_at,
  u.name,
  u.account_type
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email IN ('test@example.com', 'admin@k-xpert.co.kr')
ORDER BY au.email;
```

## 완료 후 테스트
1. 위 과정 완료 후 웹사이트에서 "일반 사용자 로그인" 버튼 클릭
2. 정상 로그인 되어야 함
3. 관리자 로그인도 테스트

이 과정을 완료하면 로그인 문제가 해결됩니다.