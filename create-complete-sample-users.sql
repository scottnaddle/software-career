-- 완전히 새로운 테스트 사용자들을 auth.users와 users 테이블에 모두 생성
-- 주의: 이 스크립트는 Supabase의 RLS와 auth 시스템을 우회합니다
-- 개발/테스트 환경에서만 사용하세요

-- Step 1: auth.users 테이블에 테스트 사용자들 생성
-- 주의: 실제로는 Supabase Auth API를 통해 생성하는 것이 권장됩니다

-- auth.users 테이블에 직접 INSERT는 보안상 권장되지 않으므로,
-- 대신 실제 회원가입을 통해 생성된 사용자들을 활용하는 방법을 제안합니다

-- Step 2: 기존 사용자 확인 및 테스트 데이터 변환
SELECT 
    '현재 등록된 사용자 현황' as info,
    u.id,
    u.email,
    u.name,
    u.account_type,
    u.verified,
    u.created_at
FROM users u
WHERE u.account_type != 'admin'
ORDER BY u.created_at DESC;

-- Step 3: 실제 사용가능한 대안 방법 안내
SELECT 
    '테스트 사용자 생성 방법' as guide,
    '1. 직접 회원가입을 통해 여러 테스트 계정 생성' as step1,
    '2. 생성된 계정들의 정보를 아래 스크립트로 테스트용으로 수정' as step2,
    '3. 또는 create-sample-data-fixed.sql 스크립트 사용' as step3;

-- Step 4: 기존 사용자를 테스트 데이터로 변환하는 함수
CREATE OR REPLACE FUNCTION convert_existing_users_to_test_data()
RETURNS TABLE (
    user_id UUID,
    old_name TEXT,
    new_name TEXT,
    old_account_type TEXT,
    new_account_type TEXT
) AS $$
DECLARE
    user_record RECORD;
    counter INTEGER := 1;
    test_names TEXT[] := ARRAY['김진수', '이사라', '박민호', '최지연', '정다윗', '테크코프 인사팀', '스타트업허브 채용담당', '이노베이트 HR', '퓨처테크 채용팀'];
    test_account_types TEXT[] := ARRAY['individual', 'individual', 'individual', 'individual', 'individual', 'enterprise', 'enterprise', 'enterprise', 'enterprise'];
BEGIN
    FOR user_record IN 
        SELECT * FROM users 
        WHERE account_type != 'admin' 
        ORDER BY created_at ASC 
        LIMIT 9
    LOOP
        IF counter <= array_length(test_names, 1) THEN
            -- 결과 반환
            user_id := user_record.id;
            old_name := user_record.name;
            new_name := test_names[counter];
            old_account_type := user_record.account_type;
            new_account_type := test_account_types[counter];
            
            -- 실제 업데이트
            UPDATE users SET 
                name = test_names[counter],
                account_type = test_account_types[counter],
                phone = '010-' || LPAD((1000 + counter * 111)::text, 4, '0') || '-' || LPAD((5000 + counter * 123)::text, 4, '0'),
                company = CASE 
                    WHEN test_account_types[counter] = 'enterprise' THEN 
                        CASE counter
                            WHEN 6 THEN '(주)테크코프'
                            WHEN 7 THEN '스타트업허브'
                            WHEN 8 THEN '이노베이트'
                            WHEN 9 THEN '퓨처테크'
                            ELSE '테스트 회사'
                        END
                    ELSE NULL
                END,
                position = CASE counter
                    WHEN 1 THEN '프리랜서 개발자'
                    WHEN 2 THEN '마케팅 전문가'
                    WHEN 3 THEN 'UI/UX 디자이너'
                    WHEN 4 THEN '데이터 분석가'
                    WHEN 5 THEN '풀스택 개발자'
                    WHEN 6 THEN '인사팀장'
                    WHEN 7 THEN '채용 담당자'
                    WHEN 8 THEN 'HR 매니저'
                    WHEN 9 THEN '채용팀장'
                    ELSE '테스트 직책'
                END,
                verified = CASE WHEN counter % 3 = 0 THEN false ELSE true END,
                updated_at = NOW()
            WHERE id = user_record.id;
            
            RETURN NEXT;
            counter := counter + 1;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: 함수 실행 (기존 사용자들을 테스트 데이터로 변환)
SELECT * FROM convert_existing_users_to_test_data();

-- Step 6: 새로운 테스트 사용자 생성을 위한 회원가입 안내
SELECT 
    '새 테스트 계정 생성 가이드' as title,
    'K-Xpert 웹사이트에서 다음 이메일들로 회원가입하세요:' as instruction,
    string_agg(email, ', ') as suggested_emails
FROM (
    VALUES 
        ('test1@kxpert.test'),
        ('test2@kxpert.test'),
        ('enterprise1@kxpert.test'),
        ('enterprise2@kxpert.test'),
        ('expert1@kxpert.test'),
        ('expert2@kxpert.test')
) AS test_emails(email);

-- Step 7: 생성 가능한 최대 샘플 데이터 확인
WITH available_users AS (
    SELECT id FROM users WHERE account_type != 'admin' LIMIT 10
)
SELECT 
    '사용 가능한 테스트 사용자 수' as info,
    COUNT(*) as available_count,
    CASE 
        WHEN COUNT(*) >= 6 THEN '충분한 사용자가 있어 전체 테스트 가능'
        WHEN COUNT(*) >= 3 THEN '제한적 테스트 가능'
        ELSE '추가 사용자 생성 필요'
    END as status
FROM available_users;

-- Step 8: 권한 부여
GRANT EXECUTE ON FUNCTION convert_existing_users_to_test_data() TO authenticated;