-- 관리자 대시보드 테스트를 위한 구체적인 테스트 데이터 생성
-- 승인대기(2), 승인완료(1), 거절(0) → 승인대기(2), 승인완료(1), 거절(1)로 수정하여 모든 기능 테스트 가능

-- Step 1: 기존 데이터 정리 (필요시)
-- DELETE FROM expert_verifications;
-- DELETE FROM payments WHERE created_at >= NOW() - INTERVAL '1 hour';
-- DELETE FROM review_requests WHERE created_at >= NOW() - INTERVAL '1 hour';

-- Step 2: 테스트용 사용자 추가 생성 (기존 사용자가 부족한 경우)
DO $$
DECLARE
    current_user_count INTEGER;
    test_user_id UUID;
BEGIN
    -- 현재 사용자 수 확인
    SELECT COUNT(*) INTO current_user_count FROM users WHERE account_type != 'admin';
    
    -- 사용자가 부족하면 추가 생성 (최소 6명 필요)
    IF current_user_count < 6 THEN
        FOR i IN 1..(6 - current_user_count) LOOP
            test_user_id := gen_random_uuid();
            
            -- auth.users에는 실제로는 Supabase Auth를 통해 생성되어야 하지만
            -- 테스트를 위해 users 테이블에만 생성
            INSERT INTO users (
                id,
                email,
                name,
                phone,
                account_type,
                company,
                position,
                verified,
                created_at,
                updated_at
            ) VALUES (
                test_user_id,
                'testuser' || i || '@test.com',
                CASE i
                    WHEN 1 THEN '김테스트'
                    WHEN 2 THEN '이테스트'
                    WHEN 3 THEN '박테스트'
                    WHEN 4 THEN '최테스트'
                    WHEN 5 THEN '테스트기업'
                    ELSE '추가테스트' || i
                END,
                '010-' || LPAD((1000 + i * 111)::text, 4, '0') || '-' || LPAD((5000 + i * 123)::text, 4, '0'),
                CASE WHEN i <= 4 THEN 'individual' ELSE 'enterprise' END,
                CASE WHEN i > 4 THEN '테스트기업' || i ELSE NULL END,
                CASE i
                    WHEN 1 THEN '개발자'
                    WHEN 2 THEN '디자이너'
                    WHEN 3 THEN '마케터'
                    WHEN 4 THEN '분석가'
                    ELSE 'HR 담당자'
                END,
                CASE WHEN i % 2 = 1 THEN true ELSE false END,
                NOW() - (i || ' days')::INTERVAL,
                NOW() - (i || ' days')::INTERVAL
            ) ON CONFLICT (id) DO NOTHING;
            
        END LOOP;
        
        RAISE NOTICE '추가 테스트 사용자 % 명을 생성했습니다.', (6 - current_user_count);
    END IF;
END $$;

-- Step 3: 전문가 신청 테스트 데이터 생성
-- 기존 데이터 삭제 후 새로 생성
DELETE FROM expert_verifications;

WITH test_users AS (
    SELECT id, name, email, company, position, phone, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type = 'individual' 
    ORDER BY created_at
    LIMIT 6
)
INSERT INTO expert_verifications (
    user_id, 
    specialties, 
    rate, 
    bio, 
    portfolio_url, 
    linkedin_url, 
    experience_years, 
    education, 
    certifications, 
    status, 
    rejection_reason,
    created_at, 
    updated_at
)
SELECT 
    id,
    CASE rn
        WHEN 1 THEN ARRAY['웹 개발', 'React', 'Node.js', 'TypeScript']
        WHEN 2 THEN ARRAY['디지털 마케팅', 'SEO', '소셜미디어 마케팅', '구글 애드워즈']
        WHEN 3 THEN ARRAY['UI/UX 디자인', 'Figma', '프로토타이핑', '사용성 테스트']
        WHEN 4 THEN ARRAY['데이터 분석', 'Python', 'SQL', '머신러닝']
        WHEN 5 THEN ARRAY['경영 컨설팅', '전략 기획', '프로세스 개선']
        ELSE ARRAY['프로젝트 관리', 'Agile', 'Scrum', 'PMP']
    END,
    CASE rn
        WHEN 1 THEN 150000
        WHEN 2 THEN 120000
        WHEN 3 THEN 130000
        WHEN 4 THEN 140000
        WHEN 5 THEN 200000
        ELSE 110000
    END,
    name || '입니다. ' || 
    CASE rn
        WHEN 1 THEN '10년 이상의 풀스택 개발 경험을 보유하고 있으며, React와 Node.js를 활용한 다양한 웹 애플리케이션을 개발해왔습니다. 특히 대규모 서비스의 아키텍처 설계와 성능 최적화에 전문성을 가지고 있습니다.'
        WHEN 2 THEN '8년간 다양한 브랜드의 디지털 마케팅을 담당하며 ROI 300% 이상의 성과를 달성해왔습니다. SEO, SEM, 소셜미디어 마케팅 등 전방위적인 디지털 마케팅 전략 수립과 실행이 가능합니다.'
        WHEN 3 THEN '사용자 중심 디자인 철학을 바탕으로 B2B, B2C 서비스의 UI/UX를 설계해왔습니다. 사용성 테스트를 통한 데이터 기반 디자인 개선과 프로토타이핑에 특화되어 있습니다.'
        WHEN 4 THEN '빅데이터 분석과 머신러닝을 활용한 비즈니스 인사이트 도출 전문가입니다. Python, R, SQL을 활용해 복잡한 데이터에서 actionable insight를 찾아내는 것이 저의 강점입니다.'
        WHEN 5 THEN '대기업과 스타트업을 아우르는 경영 컨설팅 경험으로 조직의 효율성 향상과 성장 전략 수립을 지원합니다. 특히 디지털 전환과 프로세스 혁신 영역에서 전문성을 발휘합니다.'
        ELSE '15년간의 IT 프로젝트 관리 경험으로 대규모 개발 프로젝트의 성공적인 완수를 보장합니다. Agile/Scrum 방법론을 통한 효율적인 팀 관리와 일정 준수가 저의 핵심 역량입니다.'
    END,
    'https://portfolio.' || lower(replace(name, ' ', '')) || '.dev',
    'https://linkedin.com/in/' || lower(replace(name, ' ', '')),
    CASE rn
        WHEN 1 THEN 10
        WHEN 2 THEN 8
        WHEN 3 THEN 6
        WHEN 4 THEN 7
        WHEN 5 THEN 15
        ELSE 12
    END,
    CASE rn
        WHEN 1 THEN '컴퓨터공학 학사 (KAIST), 소프트웨어공학 석사 (서울대)'
        WHEN 2 THEN '경영학 학사 (연세대), 마케팅 MBA (고려대)'
        WHEN 3 THEN '산업디자인 학사 (홍익대), HCI 석사 (KAIST)'
        WHEN 4 THEN '통계학 학사 (서울대), 데이터사이언스 석사 (연세대)'
        WHEN 5 THEN '경영학 학사 (서울대), 경영학 MBA (Wharton)'
        ELSE '산업공학 학사 (포항공대), 경영공학 석사 (서울대)'
    END,
    CASE rn
        WHEN 1 THEN ARRAY['AWS Solutions Architect Professional', 'Google Cloud Professional Developer']
        WHEN 2 THEN ARRAY['Google Ads 인증', 'Facebook Marketing Professional', 'Google Analytics IQ']
        WHEN 3 THEN ARRAY['Adobe Certified Expert', 'UX 디자인 자격증']
        WHEN 4 THEN ARRAY['AWS Machine Learning Specialty', 'Google Data Engineer']
        WHEN 5 THEN ARRAY['PMP', '경영지도사', 'Six Sigma Black Belt']
        ELSE ARRAY['PMP', 'CSM (Certified Scrum Master)', 'SAFe Agilist']
    END,
    CASE rn
        WHEN 1 THEN 'pending'    -- 승인 대기 1
        WHEN 2 THEN 'pending'    -- 승인 대기 2
        WHEN 3 THEN 'verified'   -- 승인 완료 1
        WHEN 4 THEN 'rejected'   -- 거절 1
        WHEN 5 THEN 'pending'    -- 추가 승인 대기 (총 3개가 되도록)
        ELSE 'verified'          -- 추가 승인 완료
    END,
    CASE 
        WHEN rn = 4 THEN '제출된 포트폴리오가 요구 기준에 미달하며, 실무 경험을 증명할 수 있는 추가 자료가 필요합니다. 최소 3년 이상의 실제 프로젝트 경험과 관련 성과를 보여주는 자료를 보완해 주시기 바랍니다.'
        ELSE NULL
    END,
    NOW() - (rn || ' days')::INTERVAL,
    NOW() - (rn || ' days')::INTERVAL
FROM test_users;

-- Step 4: 결제 테스트 데이터 생성
WITH payment_users AS (
    SELECT id, name, email, account_type, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type IN ('individual', 'enterprise')
    ORDER BY created_at
    LIMIT 10
)
INSERT INTO payments (
    user_id,
    amount,
    status,
    payment_method,
    type,
    transaction_id,
    created_at,
    updated_at
)
SELECT 
    id,
    CASE rn % 5
        WHEN 1 THEN 500000
        WHEN 2 THEN 300000
        WHEN 3 THEN 200000
        WHEN 4 THEN 750000
        ELSE 150000
    END,
    CASE rn % 6
        WHEN 1 THEN 'completed'
        WHEN 2 THEN 'completed'
        WHEN 3 THEN 'pending'
        WHEN 4 THEN 'pending'
        WHEN 5 THEN 'failed'
        ELSE 'completed'
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
FROM payment_users
ON CONFLICT (id) DO NOTHING;

-- Step 5: 리뷰 요청 테스트 데이터 생성
WITH review_clients AS (
    SELECT id, name, email, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM users 
    WHERE account_type IN ('individual', 'enterprise')
    ORDER BY created_at
    LIMIT 6
),
verified_experts AS (
    SELECT u.id, u.name, u.email, ROW_NUMBER() OVER (ORDER BY ev.created_at) as expert_rn
    FROM users u
    JOIN expert_verifications ev ON u.id = ev.user_id
    WHERE ev.status = 'verified'
    LIMIT 3
)
INSERT INTO review_requests (
    user_id,
    expert_id,
    title,
    description,
    skills_required,
    budget,
    status,
    deadline,
    created_at,
    updated_at
)
SELECT 
    c.id,
    CASE 
        WHEN c.rn <= 3 THEN (
            SELECT e.id FROM verified_experts e WHERE e.expert_rn = ((c.rn - 1) % 3) + 1
        )
        ELSE NULL 
    END,
    CASE c.rn
        WHEN 1 THEN '이커머스 웹사이트 성능 최적화 리뷰'
        WHEN 2 THEN '디지털 마케팅 전략 수립 및 검토'
        WHEN 3 THEN 'SaaS 제품 UI/UX 개선 컨설팅'
        WHEN 4 THEN '데이터 분석 프로세스 구축 지원'
        WHEN 5 THEN '스타트업 비즈니스 모델 검증'
        ELSE '애플리케이션 아키텍처 리뷰'
    END,
    CASE c.rn
        WHEN 1 THEN '월 방문자 100만명 규모의 이커머스 사이트의 로딩 속도 개선과 전반적인 성능 최적화가 필요합니다. 현재 페이지 로딩 시간이 3-5초로 느려 고객 이탈률이 높은 상황입니다. 프론트엔드와 백엔드 모두 검토가 필요하며, CDN 설정과 데이터베이스 쿼리 최적화도 포함해서 종합적인 개선 방안을 제시해 주시기 바랍니다.'
        WHEN 2 THEN '신규 런칭하는 B2B SaaS 제품의 디지털 마케팅 전략을 수립하고 검토해 주시기 바랍니다. 타겟은 중소기업 HR 담당자이며, 월 예산은 500만원 수준입니다. SEO, SEM, 콘텐츠 마케팅, 소셜미디어 마케팅을 포함한 통합적인 마케팅 전략과 성과 측정 방안이 필요합니다.'
        WHEN 3 THEN '기존 사용자 피드백을 바탕으로 B2C 모바일 앱의 사용성을 개선하고자 합니다. 특히 온보딩 프로세스의 이탈률이 60%로 높은 상황이며, 주요 기능의 발견성도 낮다는 피드백이 많습니다. 사용자 경험 분석과 개선 방안, 그리고 A/B 테스트 계획까지 포함한 종합적인 UX 컨설팅을 요청드립니다.'
        WHEN 4 THEN '온라인 교육 플랫폼의 학습 데이터를 활용한 분석 시스템을 구축하려 합니다. 학습자의 행동 패턴 분석, 학습 효과 측정, 개인화 추천 시스템 등을 포함한 데이터 분석 프로세스 전반에 대한 설계와 구현 방안을 검토해 주시기 바랍니다. Python과 SQL 기반의 분석 환경을 선호합니다.'
        WHEN 5 THEN '펫테크 스타트업의 비즈니스 모델을 검증하고 개선 방안을 제시해 주시기 바랍니다. 현재 B2C 펫용품 구독 서비스를 준비 중이며, 시장 분석, 경쟁사 분석, 수익 모델 검증, 마케팅 전략 등 전반적인 사업 계획에 대한 전문가 의견이 필요합니다.'
        ELSE '마이크로서비스 아키텍처로 전환을 고려 중인 레거시 시스템의 현황 분석과 전환 계획을 수립해 주시기 바랍니다. 현재 모놀리식 구조로 되어 있으며, 확장성과 유지보수성 개선이 목표입니다. 단계적 전환 방안과 리스크 관리 계획이 포함되어야 합니다.'
    END,
    CASE c.rn
        WHEN 1 THEN ARRAY['성능 최적화', '프론트엔드 개발', '백엔드 개발', 'CDN', '데이터베이스']
        WHEN 2 THEN ARRAY['디지털 마케팅', 'B2B 마케팅', 'SaaS 마케팅', 'SEO', 'SEM']
        WHEN 3 THEN ARRAY['UI/UX 디자인', '사용성 테스트', '모바일 앱', 'A/B 테스트', '사용자 경험']
        WHEN 4 THEN ARRAY['데이터 분석', 'Python', 'SQL', '추천 시스템', '데이터 시각화']
        WHEN 5 THEN ARRAY['비즈니스 전략', '시장 분석', '스타트업', '펫테크', '구독 서비스']
        ELSE ARRAY['마이크로서비스', '시스템 아키텍처', '레거시 시스템', '클라우드', 'DevOps']
    END,
    CASE c.rn
        WHEN 1 THEN 800000
        WHEN 2 THEN 600000
        WHEN 3 THEN 700000
        WHEN 4 THEN 500000
        WHEN 5 THEN 900000
        ELSE 650000
    END,
    CASE c.rn
        WHEN 1 THEN 'in_progress'
        WHEN 2 THEN 'assigned'
        WHEN 3 THEN 'completed'
        WHEN 4 THEN 'pending'
        WHEN 5 THEN 'in_progress'
        ELSE 'pending'
    END,
    NOW() + ((15 - c.rn) || ' days')::INTERVAL,
    NOW() - (c.rn || ' days')::INTERVAL,
    NOW() - (c.rn || ' days')::INTERVAL
FROM review_clients c
ON CONFLICT (id) DO NOTHING;

-- Step 6: 알림 데이터 생성 (관리자용)
INSERT INTO notifications (user_id, title, message, type, priority, data, is_read, created_at)
SELECT 
    u.id,
    '테스트 데이터 생성 완료',
    '관리자 대시보드 테스트를 위한 샘플 데이터가 생성되었습니다. 승인 대기 3건, 승인 완료 2건, 거절 1건의 전문가 신청과 다양한 결제 및 리뷰 데이터를 확인할 수 있습니다.',
    'admin_alert',
    'high',
    jsonb_build_object(
        'expert_applications', (SELECT COUNT(*) FROM expert_verifications WHERE status = 'pending'),
        'total_payments', (SELECT COUNT(*) FROM payments),
        'total_users', (SELECT COUNT(*) FROM users WHERE account_type != 'admin'),
        'data_generated_at', NOW()
    ),
    false,
    NOW()
FROM users u
WHERE u.account_type = 'admin';

-- Step 7: 생성된 데이터 요약 보고
SELECT '=== 테스트 데이터 생성 완료 ===' as status;

SELECT 
    'Users' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN account_type = 'individual' THEN 1 END) as individual_count,
    COUNT(CASE WHEN account_type = 'enterprise' THEN 1 END) as enterprise_count,
    COUNT(CASE WHEN account_type = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN account_type = 'expert' THEN 1 END) as expert_count
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
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_count
FROM review_requests;

-- 상세 전문가 신청 현황
SELECT 
    'Expert Applications Detail' as info,
    ev.status,
    u.name,
    u.email,
    array_to_string(ev.specialties, ', ') as specialties,
    ev.rate,
    ev.created_at
FROM expert_verifications ev
JOIN users u ON ev.user_id = u.id
ORDER BY ev.created_at DESC;