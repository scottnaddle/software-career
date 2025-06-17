/*
  # K-Xpert 초기 스키마 생성

  1. 새로운 테이블들
    - `users` - 사용자 정보 (개인/기업)
    - `careers` - 경력 정보
    - `certificates` - 발급된 증명서
    - `payments` - 결제 내역
    - `companies` - 회사 정보
    - `verification_requests` - 검증 요청

  2. 보안
    - 모든 테이블에 RLS 활성화
    - 사용자별 데이터 접근 제어 정책 설정

  3. 인덱스 및 제약조건
    - 성능 최적화를 위한 인덱스 생성
    - 데이터 무결성을 위한 제약조건 설정
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  account_type text NOT NULL CHECK (account_type IN ('individual', 'enterprise')),
  company text,
  position text,
  avatar_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  industry text,
  size text,
  location text,
  website text,
  logo_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Careers table
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  type text NOT NULL CHECK (type IN ('project', 'education', 'certificate', 'experience')),
  technologies text[] DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'verified', 'rejected')),
  verification_date timestamptz,
  verification_notes text,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_id uuid REFERENCES careers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('standard', 'express')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  reviewer_id uuid,
  reviewer_notes text,
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('basic', 'premium', 'official')),
  career_ids uuid[] NOT NULL,
  issue_date timestamptz DEFAULT now(),
  qr_code text NOT NULL,
  pdf_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('verification', 'certificate')),
  service_type text NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'KRW',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  transaction_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Statistics table for dashboard
CREATE TABLE IF NOT EXISTS statistics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name text NOT NULL,
  metric_value integer NOT NULL,
  date date DEFAULT CURRENT_DATE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for careers
CREATE POLICY "Users can read own careers"
  ON careers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own careers"
  ON careers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own careers"
  ON careers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for verification_requests
CREATE POLICY "Users can read own verification requests"
  ON verification_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification requests"
  ON verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for certificates
CREATE POLICY "Users can read own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for companies (public read)
CREATE POLICY "Anyone can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for statistics (public read)
CREATE POLICY "Anyone can read statistics"
  ON statistics
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_careers_user_id ON careers(user_id);
CREATE INDEX IF NOT EXISTS idx_careers_status ON careers(status);
CREATE INDEX IF NOT EXISTS idx_careers_type ON careers(type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_career_id ON verification_requests(career_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Insert demo companies
INSERT INTO companies (name, description, industry, size, location, verified) VALUES
('네이버', '글로벌 인터넷 서비스 기업으로 검색, 커머스, 핀테크, 클라우드 등 다양한 서비스를 제공합니다.', 'IT/인터넷', '3000+', '서울', true),
('카카오', '모바일 중심의 인터넷 서비스 기업으로 메신저, 콘텐츠, 커머스 등의 플랫폼을 운영합니다.', 'IT/인터넷', '4500+', '경기', true),
('토스', '혁신적인 금융 서비스를 제공하는 핀테크 기업으로 간편송금, 투자, 대출 등의 서비스를 운영합니다.', '핀테크', '2000+', '서울', true),
('배달의민족', '국내 1위 음식 배달 플랫폼으로 배달, 포장주문, 테이블오더 등의 서비스를 제공합니다.', 'O2O/플랫폼', '1800+', '서울', true),
('쿠팡', '고객중심의 이커머스 기업으로 로켓배송, 로켓프레시 등 혁신적인 물류 서비스를 제공합니다.', '이커머스', '5000+', '서울', true),
('라인', '글로벌 메신저 플랫폼을 기반으로 다양한 라이프스타일 서비스를 제공하는 기업입니다.', 'IT/인터넷', '2500+', '서울', true),
('삼성전자', '글로벌 종합 IT 기업으로 반도체, 스마트폰, 가전제품 등을 제조하는 대기업입니다.', '제조/IT', '10000+', '경기', true),
('LG전자', '혁신적인 기술과 제품으로 고객의 삶을 향상시키는 글로벌 가전 기업입니다.', '제조/가전', '8000+', '서울', true);

-- Insert demo statistics
INSERT INTO statistics (metric_name, metric_value, metadata) VALUES
('total_users', 50247, '{"type": "cumulative"}'),
('verified_careers', 127893, '{"type": "cumulative"}'),
('partner_companies', 2847, '{"type": "cumulative"}'),
('supported_countries', 15, '{"type": "cumulative"}'),
('monthly_verifications', 3420, '{"type": "monthly", "month": "2024-01"}'),
('monthly_certificates', 1250, '{"type": "monthly", "month": "2024-01"}');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON careers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();