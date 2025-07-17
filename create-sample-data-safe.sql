-- 안전한 샘플 데이터 생성 (테이블 존재 확인 후)
-- 먼저 create-missing-tables.sql을 실행한 후 이 스크립트를 실행하세요

-- Step 1: 테이블 존재 확인
DO $$
BEGIN
    -- 필요한 테이블들이 모두 존재하는지 확인
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'expert_verifications') THEN
        RAISE EXCEPTION 'expert_verifications 테이블이 존재하지 않습니다. 먼저 create-missing-tables.sql을 실행하세요.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments') THEN
        RAISE EXCEPTION 'payments 테이블이 존재하지 않습니다. 먼저 create-missing-tables.sql을 실행하세요.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
        RAISE EXCEPTION 'notifications 테이블이 존재하지 않습니다. 먼저 create-missing-tables.sql을 실행하세요.';
    END IF;
    
    RAISE NOTICE '모든 필요한 테이블이 존재합니다. 샘플 데이터 생성을 시작합니다.';
END $$;

-- Step 2: 현재 사용자 현황 확인
SELECT 
    '현재 사용자 현황' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN account_type = 'individual' THEN 1 END) as individual_users,
    COUNT(CASE WHEN account_type = 'enterprise' THEN 1 END) as enterprise_users,
    COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin_users
FROM users;

-- Step 3: 기존 사용자들을 테스트 데이터로 변환
UPDATE users SET
    name = CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN '김진수'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN '이사라'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN '박민호'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN '최지연'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN '정다윗'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN '테크코프 인사팀'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 7 THEN '스타트업허브 채용담당'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 8 THEN '이노베이트 HR'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 9 THEN '퓨처테크 채용팀'
        ELSE name
    END,
    account_type = CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) <= 5 THEN 'individual'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) <= 9 THEN 'enterprise'
        ELSE account_type
    END,
    company = CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN '(주)테크코프'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 7 THEN '스타트업허브'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 8 THEN '이노베이트'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 9 THEN '퓨처테크'
        ELSE company
    END,
    position = CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN '프리랜서 개발자'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN '마케팅 전문가'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 'UI/UX 디자이너'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN '데이터 분석가'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN '풀스택 개발자'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN '인사팀장'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 7 THEN '채용 담당자'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 8 THEN 'HR 매니저'
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 9 THEN '채용팀장'
        ELSE position
    END,
    verified = CASE WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 3 = 0 THEN false ELSE true END,
    updated_at = NOW()
WHERE account_type != 'admin';

-- Step 4: 전문가 신청 데이터 생성 (기존 사용자 ID 사용)
WITH sample_users AS (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type = 'individual' 
    LIMIT 6
)
INSERT INTO expert_verifications (user_id, specialties, rate, bio, portfolio_url, linkedin_url, experience_years, education, certifications, status, created_at, updated_at)
SELECT 
    id,
    CASE rn % 5
        WHEN 1 THEN ARRAY['웹 개발', 'React', 'Node.js']
        WHEN 2 THEN ARRAY['디지털 마케팅', 'SEO', '소셜미디어']
        WHEN 3 THEN ARRAY['UI/UX 디자인', '프로토타이핑', '사용성 테스트']
        WHEN 4 THEN ARRAY['데이터 분석', 'Python', 'SQL']
        ELSE ARRAY['경영 컨설팅', '전략 기획']
    END,
    120000 + (rn * 10000),
    name || '은(는) ' || 
    CASE rn % 3
        WHEN 1 THEN '다년간의 경험을 보유한 전문가입니다.'
        WHEN 2 THEN '다양한 프로젝트 경험이 있는 전문가입니다.'
        ELSE '해당 분야의 전문 지식을 갖춘 전문가입니다.'
    END,
    'https://portfolio.' || lower(replace(name, ' ', '')) || '.com',
    'https://linkedin.com/in/' || lower(replace(name, ' ', '')),
    5 + (rn % 10),
    CASE rn % 4
        WHEN 1 THEN '컴퓨터공학 학사'
        WHEN 2 THEN '경영학 석사'
        WHEN 3 THEN '산업디자인 학사'
        ELSE '통계학 학사'
    END,
    CASE rn % 3
        WHEN 1 THEN ARRAY['AWS Solutions Architect']
        WHEN 2 THEN ARRAY['Google Analytics 인증']
        ELSE ARRAY[]
    END,
    CASE rn % 4
        WHEN 1 THEN 'pending'
        WHEN 2 THEN 'pending'
        WHEN 3 THEN 'verified'
        ELSE 'rejected'
    END,
    NOW() - (rn || ' days')::INTERVAL,
    NOW() - (rn || ' days')::INTERVAL
FROM sample_users
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: 결제 데이터 생성
WITH sample_users AS (
    SELECT id, name, account_type, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type IN ('individual', 'enterprise')
    LIMIT 8
)
INSERT INTO payments (user_id, amount, status, payment_method, type, transaction_id, created_at, updated_at)
SELECT 
    id,
    CASE rn % 5
        WHEN 1 THEN 500000
        WHEN 2 THEN 300000
        WHEN 3 THEN 200000
        WHEN 4 THEN 750000
        ELSE 150000
    END,
    CASE rn % 4
        WHEN 1 THEN 'completed'
        WHEN 2 THEN 'completed'
        WHEN 3 THEN 'pending'
        ELSE 'failed'
    END,
    CASE rn % 3
        WHEN 1 THEN 'toss'
        WHEN 2 THEN 'kakaopay'
        ELSE 'inicis'
    END,
    CASE rn % 4
        WHEN 1 THEN 'expert_review'
        WHEN 2 THEN 'profile_verification'
        WHEN 3 THEN 'expert_certification'
        ELSE 'enterprise_service'
    END,
    CASE rn % 3
        WHEN 1 THEN 'toss_'
        WHEN 2 THEN 'kakao_'
        ELSE 'inicis_'
    END || to_char(NOW(), 'YYYYMMDD') || '_' || LPAD(rn::text, 3, '0'),
    NOW() - (rn || ' days')::INTERVAL,
    NOW() - (rn || ' days')::INTERVAL
FROM sample_users;

-- Step 6: 리뷰 요청 데이터 생성
WITH requester_users AS (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type IN ('individual', 'enterprise')
    LIMIT 4
),
expert_users AS (
    SELECT u.id
    FROM users u
    JOIN expert_verifications ev ON u.id = ev.user_id
    WHERE ev.status = 'verified'
    LIMIT 2
)
INSERT INTO review_requests (user_id, expert_id, title, description, skills_required, budget, status, deadline, created_at, updated_at)
SELECT 
    r.id,
    CASE WHEN r.rn <= 2 THEN (SELECT id FROM expert_users LIMIT 1 OFFSET (r.rn-1) % 2) ELSE NULL END,
    CASE r.rn
        WHEN 1 THEN '웹서비스 아키텍처 리뷰'
        WHEN 2 THEN '비즈니스 모델 검토'
        WHEN 3 THEN 'IT 인프라 개선 방안'
        ELSE '개인 포트폴리오 리뷰'
    END,
    CASE r.rn
        WHEN 1 THEN '신규 웹서비스의 전체적인 아키텍처와 확장성에 대한 전문가 리뷰를 요청합니다.'
        WHEN 2 THEN '스타트업의 비즈니스 모델과 수익 구조에 대한 전략적 조언이 필요합니다.'
        WHEN 3 THEN '기존 IT 인프라의 문제점 분석 및 개선 방안 제시'
        ELSE '취업을 위한 개인 포트폴리오에 대한 전문가 피드백을 받고 싶습니다.'
    END,
    CASE r.rn
        WHEN 1 THEN ARRAY['시스템 아키텍처', '확장성', '성능 최적화']
        WHEN 2 THEN ARRAY['비즈니스 전략', '수익 모델', '시장 분석']
        WHEN 3 THEN ARRAY['인프라 설계', '클라우드 마이그레이션']
        ELSE ARRAY['포트폴리오 리뷰', '커리어 조언']
    END,
    CASE r.rn
        WHEN 1 THEN 500000
        WHEN 2 THEN 300000
        WHEN 3 THEN 750000
        ELSE 200000
    END,
    CASE r.rn
        WHEN 1 THEN 'in_progress'
        WHEN 2 THEN 'assigned'
        WHEN 3 THEN 'completed'
        ELSE 'pending'
    END,
    NOW() + ((10 - r.rn) || ' days')::INTERVAL,
    NOW() - (r.rn || ' days')::INTERVAL,
    NOW() - (r.rn || ' days')::INTERVAL
FROM requester_users r;

-- Step 7: 알림 데이터 생성
WITH sample_users AS (
    SELECT id, name, account_type, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type != 'admin'
    LIMIT 10
)
INSERT INTO notifications (user_id, title, message, type, priority, data, is_read, created_at)
SELECT 
    id,
    CASE rn % 4
        WHEN 1 THEN '전문가 신청 접수'
        WHEN 2 THEN '결제 완료'
        WHEN 3 THEN '프로필 업데이트'
        ELSE '시스템 알림'
    END,
    CASE rn % 4
        WHEN 1 THEN '전문가 인증 신청이 접수되었습니다.'
        WHEN 2 THEN '결제가 성공적으로 완료되었습니다.'
        WHEN 3 THEN '프로필 정보가 업데이트되었습니다.'
        ELSE '시스템 점검이 예정되어 있습니다.'
    END,
    CASE rn % 4
        WHEN 1 THEN 'expert_application'
        WHEN 2 THEN 'payment_completed'
        WHEN 3 THEN 'profile_update'
        ELSE 'system'
    END,
    CASE rn % 3
        WHEN 1 THEN 'high'
        WHEN 2 THEN 'medium'
        ELSE 'low'
    END,
    '{}',
    CASE rn % 3 WHEN 1 THEN true ELSE false END,
    NOW() - (rn || ' hours')::INTERVAL
FROM sample_users;

-- Step 8: 관리자에게 요약 알림 생성
INSERT INTO notifications (user_id, title, message, type, priority, data, is_read, created_at)
SELECT 
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
WHERE u.account_type = 'admin';

-- Step 9: 생성된 데이터 요약 보고
SELECT '=== 샘플 데이터 생성 완료 ===' as status;

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
FROM expert_verifications;

SELECT 
    'Payments' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue
FROM payments;

SELECT 
    'Review Requests' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM review_requests;

SELECT 
    'Notifications' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM notifications;