# K-Xpert 관리자 계정 설정 가이드

## 📋 개요

K-Xpert 플랫폼의 관리자 계정을 설정하기 위한 단계별 가이드입니다.

## 🔧 1단계: 데이터베이스 마이그레이션 실행

먼저 관리자 계정을 생성하는 마이그레이션을 실행합니다:

```bash
# Supabase 프로젝트 디렉토리에서 실행
supabase db push
```

또는 특정 마이그레이션 파일만 실행:

```bash
# 관리자 계정 생성 마이그레이션 실행
supabase db reset
```

## 🎯 2단계: Supabase Auth 사용자 생성

마이그레이션 실행 후, 실제 인증 사용자를 생성해야 합니다. 다음 방법 중 하나를 선택하세요:

### 방법 1: Supabase Dashboard 사용 (권장)

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. **Authentication** → **Users** 메뉴로 이동
4. **Invite User** 버튼 클릭
5. 다음 정보 입력:
   - **Email**: `admin@k-xpert.co.kr`
   - **Password**: 안전한 비밀번호 설정 (예: `AdminK-Xpert2024!`)
   - **Confirm Password**: 동일한 비밀번호 재입력
6. **Send Invitation** 클릭

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI로 사용자 생성
supabase auth users create admin@k-xpert.co.kr --password AdminK-Xpert2024!
```

### 방법 3: SQL 함수 사용

```sql
-- Supabase SQL Editor에서 실행
SELECT auth.create_user(
    'admin@k-xpert.co.kr',
    'AdminK-Xpert2024!',
    '{
        "user_id": "00000000-0000-0000-0000-000000000001",
        "email": "admin@k-xpert.co.kr",
        "name": "K-Xpert 관리자"
    }'::jsonb
);
```

## 🔍 3단계: 관리자 계정 확인

### 데이터베이스 확인

```sql
-- 관리자 사용자 정보 확인
SELECT * FROM users WHERE email = 'admin@k-xpert.co.kr';

-- 관리자 역할 확인
SELECT * FROM user_roles WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 인증 사용자 확인
SELECT * FROM auth.users WHERE email = 'admin@k-xpert.co.kr';
```

### 로그인 테스트

1. 웹 애플리케이션에서 `/login` 페이지로 이동
2. 다음 정보로 로그인:
   - **이메일**: `admin@k-xpert.co.kr`
   - **비밀번호**: 설정한 비밀번호
3. 로그인 성공 후 우상단 사용자 메뉴에서 **"관리자 대시보드"** 항목 확인
4. `/admin-dashboard` 접근 가능 여부 확인

## 🎛️ 4단계: 관리자 대시보드 접근

로그인 성공 후:

1. **Header의 사용자 메뉴** 클릭
2. **"관리자 대시보드"** 선택
3. 또는 직접 `/admin-dashboard` URL 접근

### 관리자 대시보드 기능

- **개요**: 시스템 전반 통계
- **전문가 관리**: 전문가 신청 승인/거절
- **결제 관리**: 결제 내역 모니터링
- **사용자 관리**: 사용자 계정 관리

## 🔒 5단계: 보안 설정

### 비밀번호 보안 강화

```sql
-- 비밀번호 정책 설정 (선택사항)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@k-xpert.co.kr';
```

### 추가 보안 조치

1. **2FA 설정**: Supabase Dashboard에서 2단계 인증 활성화
2. **IP 제한**: 특정 IP에서만 관리자 접근 허용
3. **세션 타임아웃**: 관리자 세션 타임아웃 설정

## 🛠️ 트러블슈팅

### 문제 1: 로그인 시 "관리자 대시보드" 메뉴가 보이지 않음

**해결방법**:
```sql
-- 사용자 역할 확인
SELECT u.email, u.account_type, ur.role 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.email = 'admin@k-xpert.co.kr';

-- 역할이 없다면 추가
INSERT INTO user_roles (user_id, role, is_active) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'admin', true);
```

### 문제 2: 관리자 대시보드 접근 시 권한 오류

**해결방법**:
```sql
-- account_type 확인 및 수정
UPDATE users 
SET account_type = 'admin' 
WHERE email = 'admin@k-xpert.co.kr';
```

### 문제 3: 인증 사용자와 프로필 사용자 ID 불일치

**해결방법**:
```sql
-- auth.users의 실제 ID 확인
SELECT id, email FROM auth.users WHERE email = 'admin@k-xpert.co.kr';

-- users 테이블의 ID 업데이트
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@k-xpert.co.kr')
WHERE email = 'admin@k-xpert.co.kr';
```

## 📊 추가 설정

### 관리자 알림 설정

```sql
-- 관리자 알림 활성화
UPDATE user_settings 
SET notification_preferences = '{
    "expert_applications": true,
    "payment_updates": true,
    "system_alerts": true,
    "user_reports": true,
    "security_alerts": true
}'::jsonb
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@k-xpert.co.kr');
```

### 시스템 설정 확인

```sql
-- 시스템 설정 확인
SELECT * FROM system_settings WHERE key LIKE 'admin%';
```

## 🎉 완료!

관리자 계정 설정이 완료되었습니다. 이제 다음 작업을 수행할 수 있습니다:

1. ✅ **전문가 신청 승인/거절**
2. ✅ **결제 내역 모니터링**
3. ✅ **사용자 관리**
4. ✅ **시스템 통계 확인**
5. ✅ **보안 이벤트 추적**

---

**중요 정보**:
- **관리자 이메일**: admin@k-xpert.co.kr
- **사용자 ID**: 00000000-0000-0000-0000-000000000001
- **역할**: admin
- **계정 유형**: admin

보안을 위해 초기 비밀번호는 즉시 변경하고, 정기적으로 업데이트하세요!