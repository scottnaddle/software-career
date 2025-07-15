# 데이터베이스 설정 완료 가이드

## 📋 개요

경력 검증 플랫폼을 위한 완전한 데이터베이스 스키마가 구축되었습니다. 이 가이드는 데이터베이스 설정과 마이그레이션 방법을 설명합니다.

## 🗄️ 데이터베이스 구조

### 핵심 테이블들

1. **사용자 관리**
   - `auth.users` - Supabase 기본 사용자 테이블
   - `user_roles` - 사용자 역할 관리
   - `user_settings` - 사용자 개인 설정

2. **전문가 시스템**
   - `expert_profiles` - 전문가 프로필 정보
   - `specialization_categories` - 전문 분야 카테고리
   - `review_requests` - 검토 요청 관리
   - `review_results` - 검토 결과 저장

3. **결제 시스템**
   - `payments` - 결제 정보 관리
   - `webhook_events` - 웹훅 이벤트 큐

4. **파일 관리**
   - `file_attachments` - 파일 첨부 정보
   - Supabase Storage 연동

5. **알림 시스템**
   - `notifications` - 사용자 알림
   - `email_queue` - 이메일 발송 큐
   - `push_notification_queue` - 푸시 알림 큐

6. **보안 및 감사**
   - `audit_logs` - 감사 로그
   - `security_events` - 보안 이벤트
   - `rate_limits` - 속도 제한

7. **시스템 관리**
   - `system_settings` - 시스템 설정
   - `statistics` - 통계 데이터
   - `scheduled_jobs` - 배치 작업 스케줄

## 🚀 마이그레이션 실행

### 1. 순차적 마이그레이션 실행

```bash
# 1. 기본 expert review 시스템 (이미 존재하는 경우 스킵)
supabase db reset

# 2. 완전한 데이터베이스 스키마 적용
supabase db push

# 3. 마이그레이션 파일들이 순서대로 실행됩니다:
# - 20250714000001_complete_database_schema.sql
# - 20250714000002_database_functions_and_views.sql
# - 20250714000003_enhanced_security_policies.sql
# - 20250714000004_realtime_and_webhooks.sql
# - 20250714000005_final_setup_and_indexes.sql
```

### 2. 마이그레이션 검증

```sql
-- 마이그레이션 상태 확인
SELECT * FROM system_settings WHERE key IN ('database_version', 'last_migration', 'setup_completed_at');

-- 테이블 존재 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 인덱스 확인
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## 🔧 주요 기능들

### 1. 자동화된 함수들

#### 전문가 관리
- `approve_expert_profile()` - 전문가 승인
- `reject_expert_profile()` - 전문가 거절
- `find_matching_experts()` - 전문가 매칭
- `auto_assign_review_request()` - 자동 배정

#### 알림 시스템
- `create_notification()` - 알림 생성
- `queue_email()` - 이메일 큐 등록
- `queue_push_notification()` - 푸시 알림 큐 등록

#### 시스템 관리
- `cleanup_old_data()` - 오래된 데이터 정리
- `verify_data_integrity()` - 데이터 무결성 검증
- `auto_fix_data_issues()` - 데이터 문제 자동 수정

### 2. 실시간 기능

#### 실시간 채널
- `notifications` - 사용자 알림
- `review_updates` - 검토 상태 업데이트
- `expert_updates` - 전문가 프로필 업데이트
- `payment_updates` - 결제 상태 업데이트

#### 자동 트리거
- 알림 생성 시 실시간 전송
- 검토 상태 변경 시 웹훅 발송
- 결제 완료 시 자동 알림

### 3. 보안 정책

#### Row Level Security (RLS)
- 모든 테이블에 적절한 RLS 정책 적용
- 사용자별 데이터 접근 제한
- 역할 기반 접근 제어

#### 속도 제한
- 사용자/IP별 요청 제한
- 자동 차단 기능
- 보안 이벤트 로깅

## 📊 성능 최적화

### 1. 인덱스 최적화
- 복합 인덱스로 쿼리 성능 향상
- 부분 인덱스로 스토리지 절약
- GIN 인덱스로 배열 검색 최적화

### 2. 뷰 및 함수
- `expert_statistics` - 전문가 통계 뷰
- `review_request_details` - 검토 요청 상세 뷰
- `available_review_requests` - 사용 가능한 검토 요청 뷰
- `realtime_dashboard_metrics` - 실시간 대시보드 메트릭

### 3. 캐시 전략
- `invalidate_cache()` 함수로 캐시 무효화
- 실시간 캐시 업데이트 알림

## 🛠️ 관리 도구

### 1. 데이터 무결성 검증
```sql
-- 데이터 무결성 검사 실행
SELECT * FROM verify_data_integrity();

-- 문제 자동 수정
SELECT auto_fix_data_issues();
```

### 2. 시스템 상태 확인
```sql
-- 시스템 상태 모니터링
SELECT get_system_health();

-- 성능 메트릭 확인
SELECT * FROM performance_metrics;

-- 실시간 대시보드 메트릭
SELECT * FROM realtime_dashboard_metrics;
```

### 3. 배치 작업 관리
```sql
-- 스케줄된 작업 확인
SELECT * FROM scheduled_jobs ORDER BY next_run_at;

-- 수동 데이터 정리 실행
SELECT cleanup_old_data();
```

## 🔒 보안 설정

### 1. 필수 환경 변수
```env
# Supabase 설정
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 결제 시스템
TOSS_SECRET_KEY=your_toss_secret_key
INICIS_API_KEY=your_inicis_api_key
KAKAO_ADMIN_KEY=your_kakao_admin_key

# 이메일 설정
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### 2. 기본 관리자 설정
```sql
-- 관리자 계정 생성 (실제 이메일로 변경 필요)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@k-xpert.co.kr';
```

### 3. 시스템 설정
```sql
-- 기본 시스템 설정 확인
SELECT * FROM system_settings WHERE is_public = true;

-- 설정 업데이트
UPDATE system_settings 
SET value = '"your_value"'::jsonb 
WHERE key = 'your_key';
```

## 📈 모니터링 및 유지보수

### 1. 정기 점검 사항
- 데이터베이스 성능 메트릭 확인
- 느린 쿼리 모니터링
- 보안 이벤트 검토
- 저장공간 사용량 확인

### 2. 자동화된 유지보수
- 오래된 데이터 자동 삭제
- 통계 정보 자동 업데이트
- 웹훅 재시도 처리
- 이메일 발송 재시도

### 3. 백업 및 복구
```sql
-- 데이터 스냅샷 생성
SELECT create_data_snapshot();

-- 백업 상태 확인
SELECT * FROM system_settings WHERE key = 'last_snapshot';
```

## 🚨 트러블슈팅

### 1. 일반적인 문제들

#### 마이그레이션 실패
```bash
# 마이그레이션 상태 확인
supabase status

# 데이터베이스 리셋 후 재시도
supabase db reset
supabase db push
```

#### 성능 문제
```sql
-- 느린 쿼리 확인
SELECT query, calls, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 인덱스 사용률 확인
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 데이터 무결성 문제
```sql
-- 무결성 검사 실행
SELECT * FROM verify_data_integrity();

-- 문제 자동 수정
SELECT auto_fix_data_issues();
```

### 2. 로그 확인
```sql
-- 최근 보안 이벤트
SELECT * FROM security_events 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 시스템 오류 로그
SELECT * FROM audit_logs 
WHERE action LIKE '%ERROR%'
ORDER BY created_at DESC
LIMIT 20;
```

## 🎯 다음 단계

데이터베이스 설정이 완료되었습니다. 이제 다음 단계로 진행할 수 있습니다:

1. **백엔드 API 테스트** - Edge Functions와 데이터베이스 연동 테스트
2. **프론트엔드 연동** - React 앱과 새로운 API 엔드포인트 연결
3. **관리자 대시보드** - 전문가 승인 및 시스템 관리 기능
4. **결제 시스템 테스트** - 실제 결제 플로우 테스트
5. **보안 감사** - 보안 정책 및 접근 제어 검증

모든 테이블, 함수, 뷰, 인덱스가 성공적으로 생성되었으며, 프로덕션 환경에서 사용할 수 있는 완전한 데이터베이스 시스템이 구축되었습니다! 🎉