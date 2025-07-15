# 백엔드 API 배포 가이드

이 가이드는 Supabase Edge Functions를 사용하여 백엔드 API를 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

1. **Supabase CLI 설치**
   ```bash
   npm install -g supabase
   ```

2. **Supabase 프로젝트 생성**
   - [Supabase Console](https://app.supabase.com)에서 새 프로젝트 생성
   - 프로젝트 URL과 anon key 확인

3. **결제 서비스 계정 설정**
   - 토스페이먼츠 개발자 계정
   - KG이니시스 가맹점 계정
   - 카카오페이 가맹점 계정

## 🛠️ 설정 단계

### 1. Supabase 프로젝트 연결

```bash
# Supabase에 로그인
supabase login

# 프로젝트와 연결
supabase link --project-ref <your-project-ref>
```

### 2. 환경 변수 설정

Supabase 프로젝트의 Edge Functions 설정에서 다음 환경 변수를 설정하세요:

```bash
# Supabase 설정
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 결제 서비스 비밀키
TOSS_SECRET_KEY=your_toss_secret_key
INICIS_API_KEY=your_inicis_api_key
KAKAO_ADMIN_KEY=your_kakao_admin_key

# 이메일 설정 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Edge Functions 배포

각 함수를 개별적으로 배포할 수 있습니다:

```bash
# 결제 확인 함수 배포
supabase functions deploy payment-confirm

# 파일 업로드 함수 배포
supabase functions deploy file-upload

# 알림 시스템 함수 배포
supabase functions deploy notifications

# 리뷰 관리 함수 배포
supabase functions deploy review-management

# 전문가 관리 함수 배포
supabase functions deploy expert-management
```

또는 모든 함수를 한번에 배포:

```bash
# 모든 함수 배포
supabase functions deploy
```

### 4. 데이터베이스 마이그레이션

필요한 테이블과 함수를 생성합니다:

```bash
# 마이그레이션 실행
supabase db push
```

### 5. 프론트엔드 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 결제 서비스 클라이언트 키
VITE_TOSS_CLIENT_KEY=your_toss_client_key
VITE_INICIS_MID=your_inicis_merchant_id
VITE_KAKAO_CID=your_kakao_cid

# 테스트 모드
VITE_PAYMENT_TEST_MODE=true
```

## 🚀 API 엔드포인트

배포된 함수들은 다음 엔드포인트로 접근할 수 있습니다:

### 결제 확인
```
POST https://your-project-ref.supabase.co/functions/v1/payment-confirm
```

### 파일 업로드
```
POST https://your-project-ref.supabase.co/functions/v1/file-upload
GET https://your-project-ref.supabase.co/functions/v1/file-upload?filePath=...
DELETE https://your-project-ref.supabase.co/functions/v1/file-upload?fileId=...
```

### 알림 시스템
```
GET https://your-project-ref.supabase.co/functions/v1/notifications
POST https://your-project-ref.supabase.co/functions/v1/notifications/create
POST https://your-project-ref.supabase.co/functions/v1/notifications/mark-read
POST https://your-project-ref.supabase.co/functions/v1/notifications/mark-all-read
```

### 리뷰 관리
```
GET https://your-project-ref.supabase.co/functions/v1/review-management/expert-requests
GET https://your-project-ref.supabase.co/functions/v1/review-management/available
POST https://your-project-ref.supabase.co/functions/v1/review-management/create
POST https://your-project-ref.supabase.co/functions/v1/review-management/accept
```

### 전문가 관리
```
GET https://your-project-ref.supabase.co/functions/v1/expert-management/profile
POST https://your-project-ref.supabase.co/functions/v1/expert-management/apply
POST https://your-project-ref.supabase.co/functions/v1/expert-management/approve
```

## 🔧 트러블슈팅

### 1. 함수 배포 실패
```bash
# 로그 확인
supabase functions logs payment-confirm

# 함수 상태 확인
supabase functions list
```

### 2. 환경 변수 오류
```bash
# 환경 변수 확인
supabase secrets list

# 환경 변수 설정
supabase secrets set TOSS_SECRET_KEY=your_secret_key
```

### 3. 데이터베이스 연결 오류
```bash
# 데이터베이스 상태 확인
supabase status

# 마이그레이션 재실행
supabase db reset
```

## 📊 모니터링

### 1. 함수 로그 모니터링
```bash
# 실시간 로그 확인
supabase functions logs --follow payment-confirm
```

### 2. 데이터베이스 모니터링
- Supabase Console에서 실시간 활동 확인
- 쿼리 성능 모니터링

### 3. 오류 알림 설정
- Supabase의 웹훅을 사용하여 오류 알림 설정
- 이메일 또는 Slack 알림 구성

## 🔒 보안 고려사항

1. **API 키 보안**
   - 환경 변수에 민감한 정보 저장
   - 프로덕션과 개발 환경 분리

2. **인증 및 권한**
   - JWT 토큰 검증
   - 역할 기반 접근 제어

3. **파일 업로드 보안**
   - 파일 타입 제한
   - 바이러스 스캔 구현

4. **CORS 설정**
   - 적절한 CORS 정책 설정
   - 프로덕션 도메인만 허용

## 📈 성능 최적화

1. **캐싱 전략**
   - 자주 조회되는 데이터 캐싱
   - CDN 활용

2. **데이터베이스 최적화**
   - 인덱스 추가
   - 쿼리 최적화

3. **함수 최적화**
   - 콜드 스타트 최소화
   - 메모리 사용량 최적화

## 🚀 프로덕션 배포

프로덕션 환경으로 배포하기 전에:

1. **테스트 완료**
   - 모든 API 엔드포인트 테스트
   - 결제 시스템 실제 테스트

2. **모니터링 설정**
   - 에러 추적 시스템
   - 성능 모니터링

3. **백업 계획**
   - 데이터베이스 백업
   - 복구 계획 수립

4. **도메인 설정**
   - 커스텀 도메인 연결
   - SSL 인증서 설정

이제 백엔드 API가 성공적으로 배포되었습니다! 🎉