/*
  # 데모 데이터 삽입

  1. 데모 사용자 생성
  2. 샘플 경력 데이터 생성
  3. 검증 요청 및 증명서 데이터 생성
  4. 결제 내역 데이터 생성
*/

-- Insert demo users (개인 사용자)
INSERT INTO users (id, email, name, phone, account_type, verified) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'kim.global@email.com', '김글로벌', '010-1234-5678', 'individual', true),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'lee.business@email.com', '이비즈니스', '010-2345-6789', 'individual', true),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'park.expert@email.com', '박전문가', '010-3456-7890', 'individual', true),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'choi.developer@email.com', '최개발자', '010-4567-8901', 'individual', false);

-- Insert demo users (기업 사용자)
INSERT INTO users (id, email, name, phone, account_type, company, position, verified) VALUES
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'hr@naver.com', '김채용', '02-1234-5678', 'enterprise', '네이버', '인사팀장', true),
('550e8400-e29b-41d4-a716-446655440006'::uuid, 'recruit@kakao.com', '박인사', '02-2345-6789', 'enterprise', '카카오', 'HR 매니저', true);

-- Insert demo careers for 김글로벌
INSERT INTO careers (id, user_id, title, company, role, description, start_date, end_date, type, technologies, achievements, status, verification_date) VALUES
('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '전자상거래 플랫폼 개발', '네이버', '백엔드 개발자', '대규모 전자상거래 플랫폼의 주문 처리 시스템 개발 및 성능 최적화를 담당했습니다. 일일 100만 건 이상의 주문을 처리할 수 있는 시스템을 구축했습니다.', '2023-03-01', '2023-12-31', 'project', 
ARRAY['Java', 'Spring Boot', 'MySQL', 'Redis', 'Kafka'], 
ARRAY['시스템 성능 30% 향상', '주문 처리 속도 50% 개선', '장애 발생률 90% 감소'], 
'verified', '2024-01-15'),

('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '모바일 앱 개발 부트캠프', '패스트캠퍼스', '수강생', '6개월 집중 모바일 앱 개발 과정을 수료했습니다. React Native를 활용한 크로스플랫폼 앱 개발 능력을 습득했습니다.', '2022-09-01', '2023-02-28', 'education', 
ARRAY['React Native', 'JavaScript', 'Firebase', 'Redux'], 
ARRAY['우수 수료생 선정', '최종 프로젝트 1등'], 
'verified', '2023-03-10'),

('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI 챗봇 서비스 개발', '스타트업 A', '풀스택 개발자', '자연어 처리 기반 고객 상담 챗봇 서비스를 개발했습니다. 머신러닝 모델 학습부터 웹 서비스 배포까지 전 과정을 담당했습니다.', '2022-01-01', '2022-08-31', 'project', 
ARRAY['Python', 'FastAPI', 'React', 'PostgreSQL', 'TensorFlow'], 
ARRAY['고객 만족도 85% 달성', '응답 정확도 92% 구현'], 
'verified', '2022-09-05');

-- Insert demo careers for 이비즈니스
INSERT INTO careers (id, user_id, title, company, role, description, start_date, end_date, type, technologies, achievements, status, verification_date) VALUES
('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '핀테크 서비스 개발', '토스', '프론트엔드 개발자', '간편송금 서비스의 사용자 인터페이스를 개발했습니다. 사용자 경험을 최우선으로 하는 직관적인 UI/UX를 구현했습니다.', '2023-01-01', '2023-10-31', 'project', 
ARRAY['React', 'TypeScript', 'Next.js', 'Styled Components'], 
ARRAY['사용자 이탈률 40% 감소', '앱 평점 4.8점 달성'], 
'verified', '2023-11-20'),

('650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'AWS 클라우드 아키텍트 자격증', 'AWS', '자격증 취득', 'AWS Certified Solutions Architect - Professional 자격증을 취득했습니다.', '2023-06-15', NULL, 'certificate', 
ARRAY['AWS', 'Cloud Architecture', 'DevOps'], 
ARRAY['Professional 레벨 인증'], 
'verified', '2023-06-20');

-- Insert demo careers for 박전문가
INSERT INTO careers (id, user_id, title, company, role, description, start_date, end_date, type, technologies, achievements, status) VALUES
('650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, '블록체인 DApp 개발', '블록체인 스타트업', '블록체인 개발자', 'Ethereum 기반의 탈중앙화 애플리케이션을 개발했습니다. 스마트 컨트랙트 작성부터 프론트엔드 연동까지 담당했습니다.', '2023-05-01', NULL, 'project', 
ARRAY['Solidity', 'Web3.js', 'React', 'Ethereum'], 
ARRAY['TVL 100만 달러 달성', '보안 감사 통과'], 
'pending');

-- Insert demo careers for 최개발자 (검증 대기 중)
INSERT INTO careers (id, user_id, title, company, role, description, start_date, end_date, type, technologies, status) VALUES
('650e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '정보처리기사', '한국산업인력공단', '자격증 취득', '정보처리기사 자격증을 취득했습니다.', '2022-08-20', NULL, 'certificate', 
ARRAY['Database', 'Programming', 'System Analysis'], 
'pending');

-- Insert verification requests
INSERT INTO verification_requests (id, career_id, user_id, type, status, requested_at) VALUES
('750e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'express', 'in_progress', '2024-01-20'),
('750e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'standard', 'pending', '2024-01-22');

-- Insert demo certificates
INSERT INTO certificates (id, user_id, certificate_number, type, career_ids, qr_code, status) VALUES
('850e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'CERT-2024-001', 'premium', 
ARRAY['650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003']::uuid[], 
'QR_CODE_DATA_001', 'active'),

('850e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'CERT-2024-002', 'basic', 
ARRAY['650e8400-e29b-41d4-a716-446655440004']::uuid[], 
'QR_CODE_DATA_002', 'active');

-- Insert demo payments
INSERT INTO payments (id, user_id, type, service_type, amount, status, payment_method, transaction_id) VALUES
('950e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'verification', 'express', 35000, 'completed', 'card', 'TXN_001'),
('950e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'certificate', 'premium', 15000, 'completed', 'card', 'TXN_002'),
('950e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'verification', 'standard', 15000, 'completed', 'kakao', 'TXN_003'),
('950e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'verification', 'express', 35000, 'pending', 'card', NULL),
('950e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'verification', 'standard', 15000, 'pending', 'transfer', NULL);