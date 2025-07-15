# Netlify 배포 가이드

## 🚀 현재 배포 상태

**사이트 URL**: https://software-career.netlify.app

## ❌ 환경변수 오류 해결방법

현재 "Missing Supabase environment variables" 오류가 발생하고 있습니다. 이를 해결하기 위해 다음 단계를 따르세요:

## 🔧 1단계: Netlify Dashboard에서 환경변수 설정

### 접속 경로
1. [Netlify Dashboard](https://app.netlify.com) 접속
2. `software-career` 사이트 선택
3. **Site settings** 클릭
4. 왼쪽 메뉴에서 **Environment variables** 클릭

### 설정할 환경변수

다음 환경변수들을 추가해주세요:

#### 필수 환경변수
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 선택사항 환경변수
```
VITE_TOSS_CLIENT_KEY=your_toss_client_key
VITE_INICIS_MID=your_inicis_merchant_id
VITE_KAKAO_CID=your_kakao_cid
VITE_PAYMENT_TEST_MODE=true
NODE_ENV=production
```

## 📋 2단계: Supabase 정보 확인

### Supabase 프로젝트 정보 가져오기

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴로 이동
4. 다음 정보 복사:
   - **Project URL**: `VITE_SUPABASE_URL`에 사용
   - **anon public**: `VITE_SUPABASE_ANON_KEY`에 사용

### 예시 값
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 3단계: 재배포

환경변수 설정 후:

1. Netlify Dashboard에서 **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
3. 또는 새로운 커밋을 push하여 자동 배포 실행

## 🌿 4단계: 배포 브랜치 관리

현재 `netlify-deploy` 브랜치를 생성했습니다. 이 브랜치의 장점:

### 브랜치 분리의 이점
- **main 브랜치**: 개발용, 로컬 환경
- **netlify-deploy 브랜치**: 배포용, 프로덕션 환경
- 환경별 설정 분리 가능
- 배포 실패 시 main 브랜치에 영향 없음

### 브랜치 연결 설정

Netlify에서 배포 브랜치 변경:

1. **Site settings** → **Build & deploy**
2. **Branch to deploy** 섹션에서 **Edit settings**
3. **Production branch**를 `netlify-deploy`로 변경
4. **Save** 클릭

## 🔍 5단계: 배포 확인

### 성공 확인 방법

1. **사이트 접속**: https://software-career.netlify.app
2. **로그인 페이지 접근**: 환경변수가 올바르게 설정되면 로그인 가능
3. **브라우저 콘솔 확인**: 에러 메시지 없이 Supabase 연결 성공

### 오류 발생 시

환경변수 설정이 잘못되었다면, 사이트에서 친화적인 오류 메시지를 표시합니다:
- 설정해야 할 환경변수 목록
- Netlify Dashboard 링크
- 현재 설정 상태

## 🛠️ 트러블슈팅

### 문제 1: 환경변수를 설정했는데도 오류 발생

**해결방법**:
1. 환경변수명이 정확한지 확인 (대소문자 구분)
2. 값에 따옴표나 공백이 없는지 확인
3. 재배포 실행

### 문제 2: Supabase 연결 실패

**해결방법**:
1. Supabase 프로젝트가 활성 상태인지 확인
2. API URL과 Key가 정확한지 확인
3. Supabase 프로젝트의 RLS 정책 확인

### 문제 3: 빌드 실패

**해결방법**:
1. Netlify의 Deploy log 확인
2. 빌드 명령어 확인: `npm run build`
3. 의존성 문제 확인: `package.json`

## 📈 성능 최적화

### 추천 Netlify 설정

```toml
# netlify.toml 파일 생성 (선택사항)
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "max-age=31536000"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

## 🚀 자동 배포 설정

### GitHub 연동
1. Netlify에서 GitHub 연동
2. `netlify-deploy` 브랜치 선택
3. 자동 배포 활성화

### 배포 명령어
```bash
# 로컬에서 배포용 브랜치 업데이트
git checkout netlify-deploy
git merge main
git push origin netlify-deploy
```

## 📞 지원

배포 과정에서 문제가 발생하면:

1. **Netlify Deploy Logs** 확인
2. **브라우저 Developer Tools** 확인
3. **Supabase Dashboard** 에서 API 활성 상태 확인

---

**중요**: 프로덕션 환경에서는 반드시 실제 Supabase 프로젝트의 URL과 Key를 사용해야 합니다!