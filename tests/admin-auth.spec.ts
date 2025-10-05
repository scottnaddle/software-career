import { test, expect } from '@playwright/test';

test.describe('관리자 인증 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로컬 스토리지 클리어 - 보안 문제로 생략
    await page.context().clearCookies();
  });

  test('관리자 로그인 페이지 접근 확인', async ({ page }) => {
    await page.goto('/login');

    // 페이지가 올바르게 로드되었는지 확인
    await expect(page.locator('h2:has-text("K-Xpert 로그인")')).toBeVisible();

    // 관리자 로그인 버튼이 보이는지 확인
    await expect(page.locator('button:has-text("관리자 로그인")')).toBeVisible();

    // 관리자 테스트 계정 정보가 표시되는지 확인
    await expect(page.locator('text=테스트 계정: admin@k-xpert.co.kr')).toBeVisible();
  });

  test('관리자 빠른 로그인 시도', async ({ page }) => {
    await page.goto('/login');

    // 콘솔 로그 캡처 설정
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // 관리자 빠른 로그인 버튼 클릭 - 배경색으로 구분
    await page.click('.bg-red-600:has-text("관리자 로그인")');

    // 로딩 상태 대기 - 관리자 버튼 확인
    await expect(page.locator('.bg-red-400:has-text("로그인 중...")')).toBeVisible({ timeout: 5000 });

    // 로그인 프로세스가 완료될 때까지 대기 (최대 30초)
    try {
      await page.waitForTimeout(30000);
    } catch (error) {
      console.log('타임아웃 발생 - 현재 상태 확인 중...');
    }

    // 콘솔 로그 출력
    console.log('=== 콘솔 메시지 ===');
    consoleMessages.forEach(msg => console.log(msg));

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);

    // 에러 메시지 확인
    const errorElement = page.locator('.bg-red-50, .text-red-700');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('에러 메시지:', errorText);
    }

    // 성공적으로 리디렉션되었는지 확인
    if (currentUrl.includes('/admin-dashboard')) {
      console.log('✅ 관리자 대시보드로 성공적으로 리디렉션됨');

      // 관리자 대시보드 내용 확인
      await expect(page.locator('h1:has-text("관리자 대시보드")')).toBeVisible({ timeout: 10000 });

    } else if (currentUrl.includes('/login')) {
      console.log('❌ 로그인 페이지에 머물러 있음 - 로그인 실패');

      // 로그인이 실패했을 경우, 수동 로그인 시도
      console.log('=== 수동 로그인 시도 ===');
      await page.fill('input[name="email"]', 'admin@k-xpert.co.kr');
      await page.fill('input[name="password"]', 'AdminK-Xpert2024!');
      await page.click('button[type="submit"]');

      // 다시 대기
      await page.waitForTimeout(10000);

      const manualLoginUrl = page.url();
      console.log('수동 로그인 후 URL:', manualLoginUrl);

      if (manualLoginUrl.includes('/admin-dashboard') || manualLoginUrl.includes('/career-search')) {
        console.log('✅ 수동 로그인 성공');
      } else {
        console.log('❌ 수동 로그인도 실패');
      }
    }
  });

  test('브라우저 콘솔에서 관리자 상태 확인', async ({ page }) => {
    await page.goto('/login');

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');

    // 브라우저 콘솔에서 인증 상태 확인
    const authStatus = await page.evaluate(async () => {
      // Supabase 클라이언트 접근 시도
      try {
        const { data: { session } } = await window.supabase?.auth.getSession();
        const user = session?.user || null;

        return {
          hasSupabase: !!window.supabase,
          hasUser: !!user,
          userEmail: user?.email || null,
          session: session ? 'exists' : 'none'
        };
      } catch (error) {
        return {
          hasSupabase: !!window.supabase,
          error: error.message
        };
      }
    });

    console.log('인증 상태:', authStatus);

    // 전역 디버그 함수 확인
    const debugFunctions = await page.evaluate(() => {
      return {
        hasAuthDebug: !!window.authDebug,
        hasCreateAdminAccount: !!window.createAdminAccount,
        hasCheckAdminStatus: !!window.checkAdminStatus,
        hasQuickAdminLogin: !!window.quickAdminLogin
      };
    });

    console.log('디버그 함수 상태:', debugFunctions);
  });

  test('로컬 스토리지 및 세션 스토리지 상태 확인', async ({ page }) => {
    await page.goto('/login');

    // 스토리지 상태 확인 - 보안 문제로 간단하게
    try {
      const storageState = await page.evaluate(() => {
        try {
          return {
            localStorageExists: typeof localStorage !== 'undefined',
            sessionStorageExists: typeof sessionStorage !== 'undefined',
            localStorageLength: localStorage?.length || 0,
            sessionStorageLength: sessionStorage?.length || 0
          };
        } catch (error) {
          return { error: error.message };
        }
      });

      console.log('스토리지 상태:', storageState);
    } catch (error) {
      console.log('스토리지 확인 중 오류:', error.message);
    }
  });

  test('수동 관리자 계정 생성 및 로그인', async ({ page }) => {
    await page.goto('/login');

    // 콘솔에서 직접 관리자 계정 생성 시도
    const createResult = await page.evaluate(async () => {
      try {
        if (window.createAdminAccount) {
          console.log('관리자 계정 생성 함수 호출 시도...');
          const result = await window.createAdminAccount('admin@k-xpert.co.kr', 'Admin User');
          return { success: true, result };
        } else {
          return { success: false, error: 'createAdminAccount 함수를 찾을 수 없음' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    console.log('계정 생성 결과:', createResult);

    // 계정 생성 후 상태 확인
    await page.waitForTimeout(3000);

    const afterCreateStatus = await page.evaluate(async () => {
      try {
        const { data: { session } } = await window.supabase?.auth.getSession();
        return {
          hasSession: !!session,
          userEmail: session?.user?.email || null
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('계정 생성 후 상태:', afterCreateStatus);

    // 세션이 없으면 수동 로그인 시도
    if (!afterCreateStatus.hasSession) {
      console.log('수동 로그인 시도...');
      await page.fill('input[name="email"]', 'admin@k-xpert.co.kr');
      await page.fill('input[name="password"]', 'AdminK-Xpert2024!');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(10000);

      const finalUrl = page.url();
      console.log('최종 URL:', finalUrl);

      if (finalUrl.includes('/admin-dashboard')) {
        console.log('✅ 최종 로그인 성공');
        await expect(page.locator('h1:has-text("관리자 대시보드")')).toBeVisible();
      } else {
        console.log('❌ 최종 로그인 실패');
      }
    }
  });
});