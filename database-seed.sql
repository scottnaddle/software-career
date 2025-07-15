-- K-Xpert Database Seeding Script
-- 실제 시스템 테스트를 위한 Mock Data 생성

-- 시작 전 정리
DELETE FROM payments;
DELETE FROM review_requests;
DELETE FROM expert_profiles;
DELETE FROM careers;
DELETE FROM certificates;
DELETE FROM user_roles;
DELETE FROM user_settings;
DELETE FROM users WHERE account_type != 'admin';

-- 1. 실제적인 사용자 데이터 생성
INSERT INTO users (id, email, name, phone, account_type, company, position, verified, created_at, updated_at) VALUES
-- 개인 사용자들
(gen_random_uuid(), 'kim.minsoo@gmail.com', '김민수', '010-1234-5678', 'individual', NULL, NULL, true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'lee.jiwon@naver.com', '이지원', '010-2345-6789', 'individual', NULL, NULL, true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
(gen_random_uuid(), 'park.sangho@hanmail.net', '박상호', '010-3456-7890', 'individual', NULL, NULL, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'choi.yumi@gmail.com', '최유미', '010-4567-8901', 'individual', NULL, NULL, false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'jung.hyunki@kakao.com', '정현기', '010-5678-9012', 'individual', NULL, NULL, true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

-- 기업 사용자들
(gen_random_uuid(), 'hr@samsung.com', '삼성전자 인사팀', '02-123-4567', 'enterprise', '삼성전자', 'HR Manager', true, NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'recruit@naver.com', '네이버 채용팀', '02-234-5678', 'enterprise', '네이버', 'Recruitment Lead', true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
(gen_random_uuid(), 'talent@kakao.com', '카카오 인재영입팀', '02-345-6789', 'enterprise', '카카오', 'Talent Acquisition', true, NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'hr@lotte.co.kr', '롯데그룹 인사본부', '02-456-7890', 'enterprise', '롯데그룹', 'HR Director', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'people@coupang.com', '쿠팡 피플팀', '02-567-8901', 'enterprise', '쿠팡', 'People Partner', true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),

-- 전문가 사용자들
(gen_random_uuid(), 'expert.ai@tech.com', '김테크', '010-1111-2222', 'individual', 'AI Solutions', 'AI Engineer', true, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'blockchain.dev@crypto.com', '이블록', '010-2222-3333', 'individual', 'CryptoCorp', 'Blockchain Developer', true, NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),
(gen_random_uuid(), 'senior.dev@bigtech.com', '박시니어', '010-3333-4444', 'individual', 'BigTech', 'Senior Developer', true, NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
(gen_random_uuid(), 'data.scientist@ml.com', '최데이터', '010-4444-5555', 'individual', 'ML Company', 'Data Scientist', true, NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'security.expert@cyber.com', '강보안', '010-5555-6666', 'individual', 'CyberSec', 'Security Expert', true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days');

-- 2. 사용자 역할 및 설정 생성
INSERT INTO user_roles (user_id, role, granted_by, granted_at, is_active)
SELECT 
  id, 
  CASE 
    WHEN account_type = 'admin' THEN 'admin'
    WHEN account_type = 'enterprise' THEN 'user'
    ELSE 'user'
  END as role,
  id as granted_by,
  created_at,
  true
FROM users;

INSERT INTO user_settings (user_id, email_notifications, push_notifications_enabled, language, timezone, theme, notification_preferences, privacy_settings, created_at, updated_at)
SELECT 
  id,
  true,
  (random() > 0.5),
  'ko',
  'Asia/Seoul',
  CASE WHEN random() > 0.8 THEN 'dark' ELSE 'light' END,
  '{"reviews": true, "payments": true, "marketing": false}',
  '{"profile_visible": true, "contact_visible": false}',
  created_at,
  created_at
FROM users;

-- 3. 전문가 프로필 생성
INSERT INTO expert_profiles (user_id, specialization, experience_years, certifications, portfolio_url, motivation, status, applied_at, reviewed_at, reviewed_by, created_at, updated_at)
SELECT 
  u.id,
  CASE 
    WHEN u.name LIKE '%테크%' THEN 'AI/Machine Learning'
    WHEN u.name LIKE '%블록%' THEN 'Blockchain Development'
    WHEN u.name LIKE '%시니어%' THEN 'Full Stack Development'
    WHEN u.name LIKE '%데이터%' THEN 'Data Science'
    WHEN u.name LIKE '%보안%' THEN 'Cybersecurity'
    ELSE 'Software Development'
  END as specialization,
  FLOOR(random() * 10 + 3) as experience_years,
  ARRAY[
    CASE WHEN random() > 0.5 THEN 'AWS Certified' ELSE NULL END,
    CASE WHEN random() > 0.6 THEN 'Google Cloud Professional' ELSE NULL END,
    CASE WHEN random() > 0.7 THEN 'Microsoft Azure Expert' ELSE NULL END
  ]::text[] as certifications,
  'https://portfolio-' || LOWER(REPLACE(u.name, ' ', '')) || '.com' as portfolio_url,
  '전문성을 바탕으로 경력 검증 시스템 발전에 기여하고 싶습니다. 다양한 프로젝트 경험을 통해 실무진들의 경력을 정확히 평가할 수 있는 능력을 갖추고 있습니다.',
  CASE 
    WHEN random() > 0.7 THEN 'approved'
    WHEN random() > 0.3 THEN 'pending'
    ELSE 'rejected'
  END as status,
  u.created_at + INTERVAL '1 day',
  CASE WHEN random() > 0.5 THEN u.created_at + INTERVAL '3 days' ELSE NULL END,
  CASE WHEN random() > 0.5 THEN (SELECT id FROM users WHERE account_type = 'admin' LIMIT 1) ELSE NULL END,
  u.created_at + INTERVAL '1 day',
  u.created_at + INTERVAL '1 day'
FROM users u 
WHERE u.name IN ('김테크', '이블록', '박시니어', '최데이터', '강보안');

-- 4. 경력 데이터 생성
INSERT INTO careers (user_id, title, company, role, description, start_date, end_date, type, technologies, achievements, status, created_at, updated_at)
SELECT 
  u.id,
  CASE 
    WHEN u.account_type = 'enterprise' THEN u.position
    ELSE CASE 
      WHEN random() > 0.5 THEN 'Senior Developer'
      ELSE 'Project Manager'
    END
  END as title,
  CASE 
    WHEN u.company IS NOT NULL THEN u.company
    ELSE CASE 
      WHEN random() > 0.7 THEN '스타트업'
      WHEN random() > 0.4 THEN '중견기업'
      ELSE '대기업'
    END
  END as company,
  CASE 
    WHEN random() > 0.6 THEN 'Full Stack Developer'
    WHEN random() > 0.3 THEN 'Backend Developer'
    ELSE 'Frontend Developer'
  END as role,
  '다양한 웹 애플리케이션 개발 프로젝트에 참여하여 사용자 경험을 향상시키고 시스템 성능을 최적화하는 업무를 담당했습니다. 팀원들과 협업하여 효율적인 개발 프로세스를 구축하고 코드 품질을 개선했습니다.',
  NOW() - INTERVAL '2 years' - (random() * INTERVAL '3 years'),
  CASE WHEN random() > 0.3 THEN NOW() - INTERVAL '6 months' - (random() * INTERVAL '1 year') ELSE NULL END,
  'experience',
  ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']::text[],
  ARRAY['프로젝트 성공률 95% 달성', '코드 리뷰 시스템 도입', '성능 30% 향상']::text[],
  CASE 
    WHEN random() > 0.8 THEN 'verified'
    WHEN random() > 0.4 THEN 'pending'
    ELSE 'draft'
  END as status,
  u.created_at + INTERVAL '2 days',
  u.created_at + INTERVAL '2 days'
FROM users u 
WHERE u.account_type IN ('individual', 'enterprise')
LIMIT 20;

-- 5. 결제 데이터 생성
INSERT INTO payments (user_id, order_id, payment_key, amount, provider, status, payment_method, payment_data, receipt_url, created_at, updated_at, completed_at)
SELECT 
  u.id,
  'ORDER_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  'PAY_' || substr(md5(random()::text), 1, 10),
  CASE 
    WHEN random() > 0.7 THEN 50000
    WHEN random() > 0.4 THEN 30000
    ELSE 20000
  END as amount,
  CASE 
    WHEN random() > 0.6 THEN 'toss'
    WHEN random() > 0.3 THEN 'inicis'
    ELSE 'kakao'
  END as provider,
  CASE 
    WHEN random() > 0.8 THEN 'completed'
    WHEN random() > 0.1 THEN 'pending'
    ELSE 'failed'
  END as status,
  CASE 
    WHEN random() > 0.6 THEN '신용카드'
    WHEN random() > 0.3 THEN '계좌이체'
    ELSE '카카오페이'
  END as payment_method,
  '{"card_company": "KB국민카드", "installment": "일시불"}',
  'https://receipt.example.com/' || substr(md5(random()::text), 1, 10),
  u.created_at + INTERVAL '5 days' + (random() * INTERVAL '20 days'),
  u.created_at + INTERVAL '5 days' + (random() * INTERVAL '20 days'),
  CASE WHEN random() > 0.2 THEN u.created_at + INTERVAL '5 days' + (random() * INTERVAL '20 days') + INTERVAL '10 minutes' ELSE NULL END
FROM users u 
WHERE u.account_type = 'individual'
ORDER BY random()
LIMIT 15;

-- 6. 리뷰 요청 데이터 생성
INSERT INTO review_requests (user_id, expert_id, career_id, type, description, urgency, status, order_id, requested_specializations, additional_notes, price, created_at, updated_at, assigned_at, completed_at)
SELECT 
  u.id,
  (SELECT id FROM expert_profiles WHERE status = 'approved' ORDER BY random() LIMIT 1),
  (SELECT id FROM careers WHERE user_id = u.id ORDER BY random() LIMIT 1),
  CASE 
    WHEN random() > 0.6 THEN 'verification'
    WHEN random() > 0.3 THEN 'improvement'
    ELSE 'consultation'
  END as type,
  '경력 사항에 대한 전문가 검토를 요청드립니다. 특히 기술 스택과 성과 부분에 대한 피드백을 받고 싶습니다.',
  CASE 
    WHEN random() > 0.7 THEN 'high'
    WHEN random() > 0.3 THEN 'medium'
    ELSE 'low'
  END as urgency,
  CASE 
    WHEN random() > 0.6 THEN 'completed'
    WHEN random() > 0.3 THEN 'in_progress'
    WHEN random() > 0.1 THEN 'pending'
    ELSE 'cancelled'
  END as status,
  'REV_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  ARRAY['Software Development', 'Web Development']::text[],
  '빠른 피드백 부탁드립니다.',
  CASE 
    WHEN random() > 0.5 THEN 50000
    ELSE 30000
  END as price,
  u.created_at + INTERVAL '7 days' + (random() * INTERVAL '15 days'),
  u.created_at + INTERVAL '7 days' + (random() * INTERVAL '15 days'),
  CASE WHEN random() > 0.3 THEN u.created_at + INTERVAL '7 days' + (random() * INTERVAL '15 days') + INTERVAL '2 hours' ELSE NULL END,
  CASE WHEN random() > 0.4 THEN u.created_at + INTERVAL '7 days' + (random() * INTERVAL '15 days') + INTERVAL '2 days' ELSE NULL END
FROM users u 
WHERE u.account_type = 'individual' AND EXISTS (SELECT 1 FROM careers WHERE user_id = u.id)
ORDER BY random()
LIMIT 10;

-- 7. 증명서 데이터 생성
INSERT INTO certificates (user_id, type, career_ids, issue_date, certificate_number, qr_code, status, created_at)
SELECT 
  u.id,
  CASE 
    WHEN random() > 0.7 THEN 'official'
    WHEN random() > 0.4 THEN 'premium'
    ELSE 'basic'
  END as type,
  ARRAY(SELECT id FROM careers WHERE user_id = u.id AND status = 'verified' LIMIT 3)::uuid[],
  NOW() - INTERVAL '30 days' + (random() * INTERVAL '60 days'),
  'CERT_' || TO_CHAR(NOW(), 'YYYY') || '_' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  'QR_' || substr(md5(random()::text), 1, 20),
  CASE WHEN random() > 0.9 THEN 'revoked' ELSE 'active' END,
  u.created_at + INTERVAL '10 days' + (random() * INTERVAL '30 days')
FROM users u 
WHERE u.account_type = 'individual' AND EXISTS (SELECT 1 FROM careers WHERE user_id = u.id AND status = 'verified')
ORDER BY random()
LIMIT 8;

-- 8. 파일 첨부 데이터 생성
INSERT INTO file_attachments (user_id, file_name, file_path, file_type, file_size, category, related_id, upload_status, scan_status, download_count, metadata, created_at, updated_at)
SELECT 
  u.id,
  CASE 
    WHEN random() > 0.7 THEN '이력서_' || REPLACE(u.name, ' ', '_') || '.pdf'
    WHEN random() > 0.4 THEN '포트폴리오_' || REPLACE(u.name, ' ', '_') || '.pdf'
    ELSE '자격증_' || REPLACE(u.name, ' ', '_') || '.jpg'
  END as file_name,
  '/uploads/users/' || u.id || '/' || substr(md5(random()::text), 1, 20) || '.pdf',
  CASE 
    WHEN random() > 0.6 THEN 'application/pdf'
    WHEN random() > 0.3 THEN 'image/jpeg'
    ELSE 'application/msword'
  END as file_type,
  FLOOR(random() * 5000000 + 100000) as file_size,
  CASE 
    WHEN random() > 0.6 THEN 'resume'
    WHEN random() > 0.3 THEN 'portfolio'
    ELSE 'certificate'
  END as category,
  (SELECT id FROM careers WHERE user_id = u.id ORDER BY random() LIMIT 1),
  'completed',
  CASE WHEN random() > 0.95 THEN 'infected' ELSE 'clean' END,
  FLOOR(random() * 50),
  '{"original_name": "업로드파일.pdf", "mime_type": "application/pdf"}',
  u.created_at + INTERVAL '3 days' + (random() * INTERVAL '10 days'),
  u.created_at + INTERVAL '3 days' + (random() * INTERVAL '10 days')
FROM users u 
WHERE u.account_type = 'individual'
ORDER BY random()
LIMIT 12;

-- 9. 작업 큐 데이터 생성
INSERT INTO job_queue (type, payload, status, parameters, max_retries, retry_count, created_at, updated_at)
VALUES 
('email_notification', '{"user_id": "' || (SELECT id FROM users WHERE account_type = 'individual' LIMIT 1) || '", "type": "verification_complete"}', 'completed', '{"template": "verification_email"}', 3, 0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('payment_processing', '{"order_id": "ORDER_20241201_000001", "amount": 50000}', 'active', '{"provider": "toss"}', 3, 1, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('certificate_generation', '{"user_id": "' || (SELECT id FROM users WHERE account_type = 'individual' LIMIT 1) || '", "type": "premium"}', 'completed', '{"format": "pdf"}', 3, 0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');

-- 10. 시스템 설정 업데이트
INSERT INTO system_settings (key, value, description, is_public, created_at, updated_at) VALUES
('total_users', (SELECT COUNT(*)::text FROM users), 'Total number of users', true, NOW(), NOW()),
('active_experts', (SELECT COUNT(*)::text FROM expert_profiles WHERE status = 'approved'), 'Number of approved experts', true, NOW(), NOW()),
('monthly_revenue', (SELECT COALESCE(SUM(amount), 0)::text FROM payments WHERE status = 'completed' AND created_at >= DATE_TRUNC('month', NOW())), 'Monthly revenue', false, NOW(), NOW()),
('platform_status', 'operational', 'Platform operational status', true, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 통계 확인 쿼리
SELECT 
  'users' as table_name, 
  COUNT(*) as record_count,
  account_type,
  COUNT(*) as count_by_type
FROM users 
GROUP BY account_type
UNION ALL
SELECT 
  'expert_profiles' as table_name,
  COUNT(*) as record_count,
  status as account_type,
  COUNT(*) as count_by_type
FROM expert_profiles 
GROUP BY status
UNION ALL
SELECT 
  'payments' as table_name,
  COUNT(*) as record_count,
  status as account_type,
  COUNT(*) as count_by_type
FROM payments 
GROUP BY status
ORDER BY table_name, account_type;

-- 성공 메시지
SELECT 
  'SUCCESS: Mock data generated successfully!' as message,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT ep.id) as expert_profiles,
  COUNT(DISTINCT p.id) as payments,
  COUNT(DISTINCT c.id) as careers,
  COUNT(DISTINCT cert.id) as certificates
FROM users u
LEFT JOIN expert_profiles ep ON u.id = ep.user_id
LEFT JOIN payments p ON u.id = p.user_id
LEFT JOIN careers c ON u.id = c.user_id
LEFT JOIN certificates cert ON u.id = cert.user_id;