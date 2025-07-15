# Supabase Auth 사용자 계정 설정 가이드

## 문제 상황
일반 사용자 로그인 시 "Invalid login credentials" 오류가 발생하는 이유는 `test@example.com` 계정이 Supabase Auth에 생성되지 않았기 때문입니다.

## 해결 방법

### 1. Supabase Dashboard에서 사용자 생성

**1단계: Supabase Dashboard 접속**
- [https://app.supabase.com](https://app.supabase.com) 로그인
- 해당 프로젝트 선택

**2단계: 테스트 사용자 생성**
- 왼쪽 메뉴에서 **Authentication** → **Users** 클릭
- **Add user** 버튼 클릭
- 다음 정보 입력:
  - **Email**: `test@example.com`
  - **Password**: `password123`
  - **Auto Confirm User**: ✅ 체크 (이메일 인증 생략)
- **Add user** 클릭

**3단계: 관리자 계정 확인**
- 기존 관리자 계정 확인:
  - **Email**: `admin@k-xpert.co.kr`
  - **Password**: `AdminK-Xpert2024!`
- 없다면 동일한 방법으로 생성

### 2. SQL로 프로필 생성

사용자 생성 후 다음 SQL을 실행하여 프로필을 생성하세요:

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

### 3. 확인 쿼리

```sql
-- 사용자 생성 확인
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  au.email_confirmed_at,
  u.name,
  u.account_type,
  u.created_at as profile_created
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email IN ('test@example.com', 'admin@k-xpert.co.kr')
ORDER BY au.email;
```

### 4. 문제 해결 체크리스트

- [ ] Supabase Dashboard에서 `test@example.com` 사용자 생성 완료
- [ ] 사용자 비밀번호를 `password123`으로 설정
- [ ] "Auto Confirm User" 체크박스 선택
- [ ] SQL을 통해 users 테이블에 프로필 생성
- [ ] 관리자 계정 `admin@k-xpert.co.kr`도 동일하게 확인
- [ ] 로그인 페이지에서 테스트

### 5. 추가 문제 해결

**이메일 확인 비활성화:**
- Supabase Dashboard → Authentication → Settings
- "Enable email confirmations" 체크 해제

**RLS 정책 확인:**
```sql
-- 필요시 RLS 임시 비활성화 (개발용)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## 테스트 계정 정보

생성 후 다음 계정들을 사용할 수 있습니다:

- **일반 사용자**: `test@example.com` / `password123`
- **관리자**: `admin@k-xpert.co.kr` / `AdminK-Xpert2024!`

## 주의사항

1. **개발 환경에서만 사용**: 이 계정들은 테스트 목적으로만 사용하세요
2. **비밀번호 보안**: 실제 운영에서는 더 강력한 비밀번호를 사용하세요
3. **정기적인 정리**: 불필요한 테스트 계정은 정기적으로 삭제하세요