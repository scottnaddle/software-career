# 사용자 등록 문제 해결 가이드

## 현재 문제

사용자가 회원가입을 해도:
1. 관리자 대시보드의 사용자 목록에 나타나지 않음
2. 로그인이 되지 않음

## 가능한 원인들

### 1. Supabase 이메일 확인 설정
**확인 방법:**
- Supabase Dashboard → Authentication → Settings
- "Enable email confirmations" 옵션 확인

**해결책:**
- 개발/테스트 중에는 "Enable email confirmations" 비활성화
- 또는 실제 이메일로 확인 링크 클릭

### 2. users 테이블 생성 여부
**확인 SQL:**
```sql
-- users 테이블 존재 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- users 테이블 구조 확인
\d users
```

### 3. RLS (Row Level Security) 정책
**확인 SQL:**
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 정책 임시 비활성화 (테스트용)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 4. 회원가입된 사용자 확인
**확인 SQL:**
```sql
-- auth.users에서 확인
SELECT id, email, created_at, email_confirmed_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC;

-- users 테이블에서 확인
SELECT id, email, name, account_type, created_at 
FROM users 
ORDER BY created_at DESC;

-- 매핑 확인
SELECT 
  au.id, 
  au.email as auth_email,
  au.email_confirmed_at,
  u.email as user_email,
  u.name,
  u.account_type
FROM auth.users au 
LEFT JOIN users u ON au.id = u.id 
ORDER BY au.created_at DESC;
```

## 코드 수정 사항

### 1. 회원가입 로직 개선
- 상세한 로깅 추가
- 에러 처리 강화
- 프로필 생성 실패 시에도 회원가입 성공으로 처리

### 2. 로그인 시 프로필 자동 생성
- 프로필이 없으면 auth 메타데이터로부터 자동 생성
- 기존 사용자의 누락된 프로필 복구

## 테스트 단계

1. **Supabase 설정 확인**
   - Email confirmations 비활성화
   - RLS 정책 확인

2. **새 계정으로 테스트**
   - 회원가입 시도
   - 브라우저 콘솔에서 로그 확인
   - 데이터베이스에서 사용자 확인

3. **로그인 테스트**
   - 새 계정으로 로그인 시도
   - 프로필 자동 생성 확인

## 긴급 해결책

만약 여전히 문제가 있다면:

```sql
-- 수동으로 사용자 프로필 생성
INSERT INTO users (
  id, email, name, account_type, verified, created_at, updated_at
) SELECT 
  id, email, 
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'account_type', 'individual'),
  CASE WHEN email_confirmed_at IS NOT NULL THEN true ELSE false END,
  created_at, created_at
FROM auth.users 
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;
```

이 가이드의 단계를 따라 문제를 해결할 수 있습니다.