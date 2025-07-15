# 인증 시스템 설정 가이드

## 현재 문제점

1. **환경변수 누락**
   - Netlify에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 미설정
   - 이로 인해 Supabase 연결 실패

2. **관리자 계정 설정 불완전**
   - 데이터베이스에는 admin 계정 존재
   - Supabase Auth에는 실제 계정 없음

## 해결 단계

### 1단계: Netlify 환경변수 설정

1. [Netlify Dashboard](https://app.netlify.com) 접속
2. 사이트 선택 → Site settings → Environment variables
3. 다음 변수 추가:
   ```
   VITE_SUPABASE_URL = your_supabase_project_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

### 2단계: Supabase URL 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. Settings → Authentication → URL Configuration:
   ```
   Site URL: https://software-career.netlify.app
   Redirect URLs: 
   - https://software-career.netlify.app/auth/callback
   - https://software-career.netlify.app/auth/reset-password
   ```

### 3단계: 관리자 계정 생성

Supabase Dashboard → Authentication → Users에서:
- Email: admin@k-xpert.co.kr
- Password: AdminK-Xpert2024!
- 계정 생성 후 Confirm User 클릭

### 4단계: 테스트

1. https://software-career.netlify.app/login 접속
2. admin@k-xpert.co.kr / AdminK-Xpert2024! 로그인
3. https://software-career.netlify.app/admin-dashboard 접근 확인

## 현재 구현된 기능

- ✅ 로그인/회원가입 UI
- ✅ Google/Kakao 소셜 로그인
- ✅ 패스워드 재설정
- ✅ 관리자 대시보드 접근 제어
- ✅ 사용자 프로필 관리
- ✅ 데이터베이스 스키마

## 필요한 작업

1. 환경변수 설정 (가장 우선)
2. 관리자 계정 생성
3. URL 리다이렉트 설정
4. 기능 테스트