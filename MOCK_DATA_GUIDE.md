# K-Xpert Mock Data 가이드

## 개요

실제 사용자 데이터와 DB를 연결하여 시스템 테스트용 Mocking Data를 생성하는 가이드입니다.

## 생성된 데이터 구조

### 1. 사용자 데이터 (Users)
- **개인 사용자**: 5명 (김민수, 이지원, 박상호, 최유미, 정현기)
- **기업 사용자**: 5명 (삼성전자, 네이버, 카카오, 롯데그룹, 쿠팡)
- **전문가 사용자**: 5명 (AI, 블록체인, 시니어 개발, 데이터 사이언스, 보안 전문가)

### 2. 전문가 프로필 (Expert Profiles)
- 5개의 전문가 프로필 (다양한 승인 상태)
- 전문 분야: AI/ML, 블록체인, 풀스택, 데이터 사이언스, 사이버보안
- 포트폴리오 URL 및 인증서 정보 포함

### 3. 결제 데이터 (Payments)
- 15개의 결제 기록
- 다양한 결제 상태 (완료, 대기, 실패)
- 결제 방식: 토스, 이니시스, 카카오페이
- 금액대: 20,000원 ~ 50,000원

### 4. 경력 데이터 (Careers)
- 20개의 경력 정보
- 다양한 기술 스택 및 성과
- 검증 상태별 분류

### 5. 리뷰 요청 (Review Requests)
- 10개의 리뷰 요청
- 다양한 우선순위 및 상태
- 전문가 배정 및 완료 날짜 포함

### 6. 증명서 데이터 (Certificates)
- 8개의 증명서
- 타입별 분류 (기본, 프리미엄, 공식)
- QR 코드 및 인증 번호 포함

## 사용 방법

### 1. 데이터 생성
```sql
-- Supabase SQL Editor에서 실행
\i database-seed.sql
```

### 2. 데이터 확인
```sql
-- 유틸리티 스크립트 로드
\i database-utils.sql

-- 전체 데이터 현황 확인
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM expert_profiles;
SELECT * FROM payments ORDER BY created_at DESC;
```

### 3. 관리자 대시보드 테스트
Mock 데이터 생성 후 다음 기능들을 테스트할 수 있습니다:

- **개요 탭**: 실시간 통계 및 차트
- **전문가 관리**: 승인 대기 전문가 처리
- **결제 관리**: 결제 내역 조회 및 필터링
- **사용자 관리**: 사용자 검색 및 관리

## 주요 테스트 시나리오

### 1. 회원가입 및 로그인
```javascript
// 테스트 계정 정보
const testUsers = [
  { email: 'kim.minsoo@gmail.com', name: '김민수', type: 'individual' },
  { email: 'hr@samsung.com', name: '삼성전자 인사팀', type: 'enterprise' },
  { email: 'expert.ai@tech.com', name: '김테크', type: 'expert' }
];
```

### 2. 전문가 승인 프로세스
- 승인 대기 전문가 목록 확인
- 승인/거절 액션 테스트
- 상태 변경 후 알림 확인

### 3. 결제 시스템
- 다양한 결제 방식 테스트
- 결제 상태별 필터링
- 결제 내역 검색 기능

### 4. 경력 검증
- 경력 등록 및 수정
- 전문가 검토 요청
- 검증 완료 후 증명서 발급

## 데이터 관리

### 정리 및 리셋
```sql
-- 테스트 데이터만 삭제 (관리자 계정 제외)
-- 주의: 실제 운영에서는 사용하지 마세요!
DELETE FROM users WHERE account_type != 'admin';
```

### 특정 사용자 데이터 삭제
```sql
-- 사용자와 관련된 모든 데이터 삭제
-- USER_EMAIL_HERE를 실제 이메일로 변경
-- (database-utils.sql 참조)
```

### 누락된 데이터 복구
```sql
-- 프로필 없는 사용자 자동 복구
-- 사용자 설정 및 역할 복구
-- (database-utils.sql 참조)
```

## 성능 최적화

### 1. 인덱스 확인
```sql
-- 테이블별 인덱스 사용률 확인
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. 쿼리 최적화
- 대용량 데이터 조회 시 LIMIT 사용
- 적절한 인덱스 활용
- 복합 쿼리 최적화

## 개발 팁

### 1. 빠른 테스트 데이터 생성
```sql
-- 새 테스트 사용자 생성
INSERT INTO users (id, email, name, account_type, verified, created_at, updated_at)
VALUES (gen_random_uuid(), 'new.test@example.com', 'New Test User', 'individual', true, NOW(), NOW());
```

### 2. 디버깅 쿼리
```sql
-- 시스템 상태 한눈에 보기
SELECT 
  (SELECT COUNT(*) FROM users WHERE account_type != 'admin') as users,
  (SELECT COUNT(*) FROM expert_profiles WHERE status = 'approved') as experts,
  (SELECT COUNT(*) FROM payments WHERE status = 'completed') as payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as revenue;
```

### 3. 로그 모니터링
- 브라우저 콘솔에서 상세 로그 확인
- 네트워크 탭에서 API 호출 모니터링
- Supabase 로그에서 DB 쿼리 확인

## 보안 고려사항

1. **테스트 데이터 구분**: 실제 운영 데이터와 테스트 데이터 명확히 구분
2. **민감 정보 제외**: 실제 개인정보나 결제 정보 사용 금지
3. **접근 권한**: 개발 환경에서만 사용
4. **데이터 정리**: 테스트 완료 후 불필요한 데이터 삭제

## 문제 해결

### 1. 데이터 생성 실패
- 테이블 존재 여부 확인
- RLS 정책 확인
- 권한 설정 확인

### 2. 성능 이슈
- 인덱스 추가 고려
- 쿼리 최적화
- 데이터 양 조절

### 3. 동기화 문제
- auth.users와 users 테이블 동기화
- 외래키 제약 조건 확인
- 트랜잭션 처리

이 가이드를 통해 효율적으로 Mock 데이터를 생성하고 시스템을 테스트할 수 있습니다!