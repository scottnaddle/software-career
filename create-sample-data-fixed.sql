-- K-Xpert 관리자 기능 테스트를 위한 샘플 데이터 생성 (수정된 버전)
-- 실행 전 주의: 기존 데이터와 충돌하지 않도록 확인 후 실행하세요

-- Step 1: 현재 존재하는 사용자들 확인
SELECT 
    'Existing Users Check' as info,
    COUNT(*) as total_users,
    string_agg(email, ', ') as user_emails
FROM users
WHERE created_at >= NOW() - INTERVAL '90 days';

-- Step 2: 실제 auth.users에 있는 사용자 ID들 확인 
WITH existing_auth_users AS (
    SELECT au.id, au.email, u.email as profile_email
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id
    WHERE au.created_at >= NOW() - INTERVAL '90 days'
)
SELECT 
    'Auth vs Profile Check' as info,
    COUNT(*) as auth_users,
    COUNT(profile_email) as profile_users,
    COUNT(*) - COUNT(profile_email) as missing_profiles
FROM existing_auth_users;

-- Step 3: 기존 사용자들 중에서 샘플 데이터 생성
-- 만약 기존 사용자가 부족하다면, 가상의 UUID를 사용하되 실제로는 auth.users에 먼저 생성이 필요하다는 안내

-- Step 4: 기존 사용자들의 프로필을 업데이트하여 테스트 데이터로 활용
DO $$
DECLARE
    existing_user_ids UUID[];
    user_id UUID;
    counter INTEGER := 1;
BEGIN
    -- 기존 사용자 ID들을 배열로 가져오기
    SELECT array_agg(id) INTO existing_user_ids
    FROM users 
    WHERE account_type != 'admin'
    LIMIT 10;
    
    -- 기존 사용자가 있다면 업데이트
    IF array_length(existing_user_ids, 1) > 0 THEN
        FOREACH user_id IN ARRAY existing_user_ids
        LOOP
            -- 사용자 정보를 테스트용으로 업데이트
            UPDATE users SET
                name = CASE counter
                    WHEN 1 THEN '김진수'
                    WHEN 2 THEN '이사라'
                    WHEN 3 THEN '박민호'
                    WHEN 4 THEN '최지연'
                    WHEN 5 THEN '정다윗'
                    WHEN 6 THEN '테크코프 인사팀'
                    WHEN 7 THEN '스타트업허브 채용담당'
                    WHEN 8 THEN '이노베이트 HR'
                    WHEN 9 THEN '퓨처테크 채용팀'
                    ELSE '테스트 사용자' || counter
                END,
                phone = '010-' || LPAD((1000 + counter * 111)::text, 4, '0') || '-' || LPAD((5000 + counter * 123)::text, 4, '0'),
                account_type = CASE 
                    WHEN counter <= 5 THEN 'individual'
                    WHEN counter <= 9 THEN 'enterprise'
                    ELSE 'individual'
                END,
                company = CASE
                    WHEN counter = 6 THEN '(주)테크코프'
                    WHEN counter = 7 THEN '스타트업허브'
                    WHEN counter = 8 THEN '이노베이트'
                    WHEN counter = 9 THEN '퓨처테크'
                    WHEN counter <= 5 THEN NULL
                    ELSE '테스트 회사'
                END,
                position = CASE
                    WHEN counter = 1 THEN '프리랜서 개발자'
                    WHEN counter = 2 THEN '마케팅 전문가'
                    WHEN counter = 3 THEN 'UI/UX 디자이너'
                    WHEN counter = 4 THEN '데이터 분석가'
                    WHEN counter = 5 THEN '풀스택 개발자'
                    WHEN counter = 6 THEN '인사팀장'
                    WHEN counter = 7 THEN '채용 담당자'
                    WHEN counter = 8 THEN 'HR 매니저'
                    WHEN counter = 9 THEN '채용팀장'
                    ELSE '테스트 직책'
                END,
                verified = CASE WHEN counter % 3 = 0 THEN false ELSE true END,
                updated_at = NOW()
            WHERE id = user_id;
            
            counter := counter + 1;
        END LOOP;
        
        RAISE NOTICE '기존 사용자 % 명의 정보를 테스트용으로 업데이트했습니다.', array_length(existing_user_ids, 1);
    ELSE
        RAISE NOTICE '업데이트할 기존 사용자가 없습니다. 먼저 일반 사용자들을 생성해주세요.';
    END IF;
END;
$$;

-- Step 5: 기존 사용자들을 기반으로 전문가 신청 데이터 생성
INSERT INTO expert_verifications (id, user_id, specialties, rate, bio, portfolio_url, linkedin_url, experience_years, education, certifications, status, created_at, updated_at)
SELECT 
    'ev-' || substr(md5(random()::text), 1, 8) || '-' || substr(md5(random()::text), 1, 4) || '-4000-8000-' || substr(md5(random()::text), 1, 12),
    u.id,
    CASE (ROW_NUMBER() OVER()) % 5
        WHEN 1 THEN ARRAY['웹 개발', 'React', 'Node.js']
        WHEN 2 THEN ARRAY['디지털 마케팅', 'SEO', '소셜미디어']
        WHEN 3 THEN ARRAY['UI/UX 디자인', '프로토타이핑', '사용성 테스트']
        WHEN 4 THEN ARRAY['데이터 분석', 'Python', 'SQL']
        ELSE ARRAY['경영 컨설팅', '전략 기획']
    END,
    120000 + (ROW_NUMBER() OVER()) * 10000,
    u.name || '은(는) ' || 
    CASE (ROW_NUMBER() OVER()) % 3
        WHEN 1 THEN '다년간의 경험을 보유한 전문가입니다.'
        WHEN 2 THEN '다양한 프로젝트 경험이 있는 전문가입니다.'
        ELSE '해당 분야의 전문 지식을 갖춘 전문가입니다.'
    END,
    'https://portfolio.' || lower(replace(u.name, ' ', '')) || '.com',
    'https://linkedin.com/in/' || lower(replace(u.name, ' ', '')),
    5 + (ROW_NUMBER() OVER()) % 10,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN '컴퓨터공학 학사'
        WHEN 2 THEN '경영학 석사'
        WHEN 3 THEN '산업디자인 학사'
        ELSE '통계학 학사'
    END,
    CASE (ROW_NUMBER() OVER()) % 3
        WHEN 1 THEN ARRAY['AWS Solutions Architect']
        WHEN 2 THEN ARRAY['Google Analytics 인증']
        ELSE ARRAY[]
    END,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN 'pending'
        WHEN 2 THEN 'pending'
        WHEN 3 THEN 'verified'
        ELSE 'rejected'
    END,
    NOW() - ((ROW_NUMBER() OVER()) || ' days')::INTERVAL,
    NOW() - ((ROW_NUMBER() OVER()) || ' days')::INTERVAL
FROM users u
WHERE u.account_type = 'individual' 
AND u.email NOT LIKE 'admin@%'
LIMIT 6
ON CONFLICT (id) DO NOTHING;

-- Step 6: 기존 사용자들을 기반으로 결제 데이터 생성
INSERT INTO payments (id, user_id, amount, status, payment_method, type, transaction_id, created_at, updated_at)
SELECT 
    'pay-' || substr(md5(random()::text), 1, 8) || '-' || substr(md5(random()::text), 1, 4) || '-4000-8000-' || substr(md5(random()::text), 1, 12),
    u.id,
    CASE (ROW_NUMBER() OVER()) % 5
        WHEN 1 THEN 500000
        WHEN 2 THEN 300000
        WHEN 3 THEN 200000
        WHEN 4 THEN 750000
        ELSE 150000
    END,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN 'completed'
        WHEN 2 THEN 'completed'
        WHEN 3 THEN 'pending'
        ELSE 'failed'
    END,
    CASE (ROW_NUMBER() OVER()) % 3
        WHEN 1 THEN 'toss'
        WHEN 2 THEN 'kakaopay'
        ELSE 'inicis'
    END,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN 'expert_review'
        WHEN 2 THEN 'profile_verification'
        WHEN 3 THEN 'expert_certification'
        ELSE 'enterprise_service'
    END,
    CASE (ROW_NUMBER() OVER()) % 3
        WHEN 1 THEN 'toss_'
        WHEN 2 THEN 'kakao_'
        ELSE 'inicis_'
    END || to_char(NOW(), 'YYYYMMDD') || '_' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    NOW() - ((ROW_NUMBER() OVER()) || ' days')::INTERVAL,
    NOW() - ((ROW_NUMBER() OVER()) || ' days')::INTERVAL
FROM users u
WHERE u.account_type IN ('individual', 'enterprise')
AND u.email NOT LIKE 'admin@%'
LIMIT 8
ON CONFLICT (id) DO NOTHING;

-- Step 7: 알림 데이터 생성
INSERT INTO notifications (id, user_id, title, message, type, priority, data, is_read, created_at)
SELECT 
    'notif-' || substr(md5(random()::text), 1, 8) || '-' || substr(md5(random()::text), 1, 4) || '-4000-8000-' || substr(md5(random()::text), 1, 12),
    u.id,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN '전문가 신청 접수'
        WHEN 2 THEN '결제 완료'
        WHEN 3 THEN '프로필 업데이트'
        ELSE '시스템 알림'
    END,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN '전문가 인증 신청이 접수되었습니다.'
        WHEN 2 THEN '결제가 성공적으로 완료되었습니다.'
        WHEN 3 THEN '프로필 정보가 업데이트되었습니다.'
        ELSE '시스템 점검이 예정되어 있습니다.'
    END,
    CASE (ROW_NUMBER() OVER()) % 4
        WHEN 1 THEN 'expert_application'
        WHEN 2 THEN 'payment_completed'
        WHEN 3 THEN 'profile_update'
        ELSE 'system'
    END,
    CASE (ROW_NUMBER() OVER()) % 3
        WHEN 1 THEN 'high'
        WHEN 2 THEN 'medium'
        ELSE 'low'
    END,
    '{}',
    CASE (ROW_NUMBER() OVER()) % 3 WHEN 1 THEN true ELSE false END,
    NOW() - ((ROW_NUMBER() OVER()) || ' hours')::INTERVAL
FROM users u
WHERE u.email NOT LIKE 'admin@%'
LIMIT 10
ON CONFLICT (id) DO NOTHING;

-- Step 8: 관리자에게 요약 알림 생성
INSERT INTO notifications (id, user_id, title, message, type, priority, data, is_read, created_at)
SELECT 
    'admin-summary-' || generate_random_uuid(),
    u.id,
    '관리자 대시보드 테스트 데이터 생성 완료',
    '테스트용 샘플 데이터가 생성되었습니다. 관리자 기능을 테스트해보세요.',
    'admin_alert',
    'high',
    jsonb_build_object(
        'expert_applications', (SELECT COUNT(*) FROM expert_verifications WHERE status = 'pending'),
        'total_payments', (SELECT COUNT(*) FROM payments),
        'total_users', (SELECT COUNT(*) FROM users WHERE account_type != 'admin')
    ),
    false,
    NOW()
FROM users u
WHERE u.account_type = 'admin'
ON CONFLICT (id) DO NOTHING;

-- Step 9: 생성된 데이터 요약 보고
SELECT 
    '=== 테스트 데이터 생성 완료 ===' as status;

SELECT 
    'Users' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN account_type = 'individual' THEN 1 END) as individual_count,
    COUNT(CASE WHEN account_type = 'enterprise' THEN 1 END) as enterprise_count,
    COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin_count
FROM users;

SELECT 
    'Expert Verifications' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
FROM expert_verifications
WHERE created_at >= NOW() - INTERVAL '1 hour';

SELECT 
    'Payments' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
FROM payments
WHERE created_at >= NOW() - INTERVAL '1 hour';

SELECT 
    'Notifications' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM notifications
WHERE created_at >= NOW() - INTERVAL '1 hour';