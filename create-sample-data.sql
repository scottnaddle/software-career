-- K-Xpert 관리자 기능 테스트를 위한 샘플 데이터 생성
-- 실행 전 주의: 기존 데이터와 충돌하지 않도록 확인 후 실행하세요

-- 1. 샘플 사용자들 생성 (개인 회원)
INSERT INTO users (id, email, name, phone, account_type, company, position, verified, created_at, updated_at) VALUES
-- 개인 회원들
('10000000-1000-4000-8000-100000000001', 'john.kim@gmail.com', '김진수', '010-1234-5678', 'individual', null, '프리랜서 개발자', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('10000000-1000-4000-8000-100000000002', 'sarah.lee@naver.com', '이사라', '010-2345-6789', 'individual', null, '마케팅 전문가', false, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
('10000000-1000-4000-8000-100000000003', 'mike.park@kakao.com', '박민호', '010-3456-7890', 'individual', null, 'UI/UX 디자이너', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('10000000-1000-4000-8000-100000000004', 'jenny.choi@gmail.com', '최지연', '010-4567-8901', 'individual', null, '데이터 분석가', false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('10000000-1000-4000-8000-100000000005', 'david.jung@outlook.com', '정다윗', '010-5678-9012', 'individual', null, '풀스택 개발자', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

-- 기업 회원들
('20000000-2000-4000-8000-200000000001', 'contact@techcorp.co.kr', '테크코프 인사팀', '02-1234-5678', 'enterprise', '(주)테크코프', '인사팀장', true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('20000000-2000-4000-8000-200000000002', 'hr@startuphub.com', '스타트업허브 채용담당', '02-2345-6789', 'enterprise', '스타트업허브', '채용 담당자', true, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
('20000000-2000-4000-8000-200000000003', 'recruit@innovate.kr', '이노베이트 HR', '02-3456-7890', 'enterprise', '이노베이트', 'HR 매니저', false, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
('20000000-2000-4000-8000-200000000004', 'jobs@futuretech.co.kr', '퓨처테크 채용팀', '02-4567-8901', 'enterprise', '퓨처테크', '채용팀장', true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

-- 이미 전문가가 된 사용자들
('30000000-3000-4000-8000-300000000001', 'expert.kim@expert.com', '김전문', '010-9876-5432', 'individual', '김전문 컨설팅', '시니어 컨설턴트', true, NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days'),
('30000000-3000-4000-8000-300000000002', 'lisa.expert@consulting.kr', '전문리사', '010-8765-4321', 'individual', '리사 컨설팅', '전략 컨설턴트', true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- 2. 전문가 인증 신청 데이터 (승인 대기, 승인됨, 거부됨)
INSERT INTO expert_verifications (id, user_id, specialties, rate, bio, portfolio_url, linkedin_url, experience_years, education, certifications, status, created_at, updated_at) VALUES
-- 승인 대기 중인 신청들
('ev-00000000-0001-4000-8000-000000000001', '10000000-1000-4000-8000-100000000001', ARRAY['웹 개발', 'React', 'Node.js'], 150000, '10년 경력의 풀스택 개발자입니다. 다양한 프로젝트 경험이 있습니다.', 'https://portfolio.johnkim.dev', 'https://linkedin.com/in/johnkim', 10, '컴퓨터공학 학사 (KAIST)', ARRAY['AWS Solutions Architect', 'Google Cloud Professional'], 'pending', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('ev-00000000-0002-4000-8000-000000000002', '10000000-1000-4000-8000-100000000002', ARRAY['디지털 마케팅', 'SEO', '소셜미디어'], 120000, '8년간 다양한 브랜드의 디지털 마케팅을 담당했습니다.', 'https://sarahmarketing.com', 'https://linkedin.com/in/sarahlee', 8, '경영학 석사 (연세대)', ARRAY['Google Ads 인증', 'Facebook Marketing'], 'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('ev-00000000-0003-4000-8000-000000000003', '10000000-1000-4000-8000-100000000003', ARRAY['UI/UX 디자인', '프로토타이핑', '사용성 테스트'], 130000, 'B2B, B2C 서비스 디자인 전문가입니다.', 'https://behance.net/mikepark', 'https://linkedin.com/in/mikepark', 7, '산업디자인 학사 (홍익대)', ARRAY['UX 디자인 자격증'], 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- 이미 승인된 전문가들
('ev-00000000-0004-4000-8000-000000000004', '30000000-3000-4000-8000-300000000001', ARRAY['경영 컨설팅', '디지털 전환', '프로세스 개선'], 200000, '15년 경력의 경영 컨설턴트입니다. 대기업 디지털 전환 프로젝트 다수 참여.', 'https://kimconsulting.co.kr', 'https://linkedin.com/in/expertkim', 15, 'MBA (서울대)', ARRAY['PMP', '경영지도사'], 'verified', NOW() - INTERVAL '30 days', NOW() - INTERVAL '10 days'),
('ev-00000000-0005-4000-8000-000000000005', '30000000-3000-4000-8000-300000000002', ARRAY['전략 기획', '시장 분석', '비즈니스 모델'], 180000, '전략 컨설팅 전문가로 스타트업부터 대기업까지 다양한 경험 보유.', 'https://lisastrategy.com', 'https://linkedin.com/in/lisaexpert', 12, '경제학 박사 (고려대)', ARRAY['전략기획사', 'CFA'], 'verified', NOW() - INTERVAL '35 days', NOW() - INTERVAL '15 days'),

-- 거부된 신청
('ev-00000000-0006-4000-8000-000000000006', '10000000-1000-4000-8000-100000000004', ARRAY['데이터 분석'], 80000, '데이터 분석 경험이 있습니다.', '', '', 2, '통계학 학사', ARRAY[], 'rejected', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 3. 결제 데이터 (다양한 상태)
INSERT INTO payments (id, user_id, amount, status, payment_method, type, transaction_id, created_at, updated_at) VALUES
-- 완료된 결제들
('pay-0000-0001-4000-8000-000000000001', '20000000-2000-4000-8000-200000000001', 500000, 'completed', 'toss', 'expert_review', 'toss_20250117_001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('pay-0000-0002-4000-8000-000000000002', '20000000-2000-4000-8000-200000000002', 300000, 'completed', 'kakaopay', 'profile_verification', 'kakao_20250115_002', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('pay-0000-0003-4000-8000-000000000003', '10000000-1000-4000-8000-100000000001', 200000, 'completed', 'inicis', 'expert_certification', 'inicis_20250112_003', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('pay-0000-0004-4000-8000-000000000004', '20000000-2000-4000-8000-200000000004', 750000, 'completed', 'toss', 'enterprise_service', 'toss_20250110_004', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

-- 대기 중인 결제들
('pay-0000-0005-4000-8000-000000000005', '20000000-2000-4000-8000-200000000003', 400000, 'pending', 'toss', 'expert_review', 'toss_20250117_005', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('pay-0000-0006-4000-8000-000000000006', '10000000-1000-4000-8000-100000000002', 150000, 'pending', 'kakaopay', 'profile_boost', 'kakao_20250117_006', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

-- 실패한 결제들
('pay-0000-0007-4000-8000-000000000007', '10000000-1000-4000-8000-100000000003', 250000, 'failed', 'inicis', 'expert_review', 'inicis_20250116_007', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('pay-0000-0008-4000-8000-000000000008', '10000000-1000-4000-8000-100000000004', 100000, 'failed', 'toss', 'verification_fee', 'toss_20250114_008', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- 4. 리뷰 요청 데이터
INSERT INTO review_requests (id, user_id, expert_id, title, description, skills_required, budget, status, deadline, created_at, updated_at) VALUES
-- 진행 중인 리뷰들
('rev-0000-0001-4000-8000-000000000001', '20000000-2000-4000-8000-200000000001', '30000000-3000-4000-8000-300000000001', '웹서비스 아키텍처 리뷰', '신규 웹서비스의 전체적인 아키텍처와 확장성에 대한 전문가 리뷰를 요청합니다.', ARRAY['시스템 아키텍처', '확장성', '성능 최적화'], 500000, 'in_progress', NOW() + INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
('rev-0000-0002-4000-8000-000000000002', '20000000-2000-4000-8000-200000000002', '30000000-3000-4000-8000-300000000002', '비즈니스 모델 검토', '스타트업의 비즈니스 모델과 수익 구조에 대한 전략적 조언이 필요합니다.', ARRAY['비즈니스 전략', '수익 모델', '시장 분석'], 300000, 'assigned', NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- 완료된 리뷰들
('rev-0000-0003-4000-8000-000000000003', '20000000-2000-4000-8000-200000000004', '30000000-3000-4000-8000-300000000001', 'IT 인프라 개선 방안', '기존 IT 인프라의 문제점 분석 및 개선 방안 제시', ARRAY['인프라 설계', '클라우드 마이그레이션'], 750000, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),

-- 대기 중인 리뷰들
('rev-0000-0004-4000-8000-000000000004', '10000000-1000-4000-8000-100000000001', null, '개인 포트폴리오 리뷰', '취업을 위한 개인 포트폴리오에 대한 전문가 피드백을 받고 싶습니다.', ARRAY['포트폴리오 리뷰', '커리어 조언'], 200000, 'pending', NOW() + INTERVAL '10 days', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 5. 알림 데이터
INSERT INTO notifications (id, user_id, title, message, type, priority, data, is_read, created_at) VALUES
('notif-001-4000-8000-000000000001', '10000000-1000-4000-8000-100000000001', '전문가 신청 접수', '전문가 인증 신청이 접수되었습니다. 검토 후 결과를 알려드리겠습니다.', 'expert_application', 'medium', '{"application_id": "ev-00000000-0001-4000-8000-000000000001"}', false, NOW() - INTERVAL '3 days'),
('notif-002-4000-8000-000000000002', '10000000-1000-4000-8000-100000000002', '전문가 신청 접수', '전문가 인증 신청이 접수되었습니다. 검토 후 결과를 알려드리겠습니다.', 'expert_application', 'medium', '{"application_id": "ev-00000000-0002-4000-8000-000000000002"}', false, NOW() - INTERVAL '2 days'),
('notif-003-4000-8000-000000000003', '30000000-3000-4000-8000-300000000001', '새로운 리뷰 요청', '새로운 전문가 리뷰 요청이 있습니다.', 'review_request', 'high', '{"request_id": "rev-0000-0001-4000-8000-000000000001"}', false, NOW() - INTERVAL '3 days'),
('notif-004-4000-8000-000000000004', '20000000-2000-4000-8000-200000000001', '결제 완료', '전문가 리뷰 서비스 결제가 완료되었습니다.', 'payment_completed', 'medium', '{"payment_id": "pay-0000-0001-4000-8000-000000000001"}', true, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 6. 관리자에게 알림 생성 (관리자 계정들에게)
INSERT INTO notifications (id, user_id, title, message, type, priority, data, is_read, created_at)
SELECT 
    'admin-notif-' || generate_random_uuid(),
    u.id,
    '새로운 전문가 신청',
    '검토가 필요한 전문가 인증 신청이 ' || (SELECT COUNT(*) FROM expert_verifications WHERE status = 'pending') || '건 있습니다.',
    'admin_alert',
    'high',
    '{"pending_applications": ' || (SELECT COUNT(*) FROM expert_verifications WHERE status = 'pending') || '}',
    false,
    NOW()
FROM users u
WHERE u.account_type = 'admin'
ON CONFLICT (id) DO NOTHING;

-- 샘플 데이터 생성 완료 메시지
SELECT 
    '샘플 데이터 생성 완료' as status,
    '총 ' || (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '1 hour') || '명의 사용자,' ||
    (SELECT COUNT(*) FROM expert_verifications WHERE created_at >= NOW() - INTERVAL '1 hour') || '건의 전문가 신청,' ||
    (SELECT COUNT(*) FROM payments WHERE created_at >= NOW() - INTERVAL '1 hour') || '건의 결제,' ||
    (SELECT COUNT(*) FROM review_requests WHERE created_at >= NOW() - INTERVAL '1 hour') || '건의 리뷰 요청이 생성되었습니다.' as details;