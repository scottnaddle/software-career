-- Complete Database Schema for Career Verification Platform
-- This migration adds missing tables and updates existing ones

-- 1. 결제 테이블 (payments)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    payment_key TEXT,
    amount DECIMAL(10,2) NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('toss', 'inicis', 'kakao')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_method TEXT,
    payment_data JSONB DEFAULT '{}',
    receipt_url TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. 파일 첨부 테이블 (file_attachments)
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('resume', 'portfolio', 'certificate', 'document')),
    related_id UUID, -- 관련 엔티티 ID (career_id, review_request_id 등)
    upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('pending', 'completed', 'failed')),
    scan_status TEXT DEFAULT 'pending' CHECK (scan_status IN ('pending', 'clean', 'infected', 'failed')),
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    scanned_at TIMESTAMPTZ
);

-- 3. 사용자 역할 테이블 (user_roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'expert', 'admin', 'super_admin')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 사용자 설정 테이블 (user_settings)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications_enabled BOOLEAN DEFAULT false,
    push_subscription JSONB,
    language TEXT DEFAULT 'ko',
    timezone TEXT DEFAULT 'Asia/Seoul',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 전문가 프로필 테이블 이름 수정 (experts -> expert_profiles)
-- 기존 experts 테이블을 expert_profiles로 이름 변경
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experts') THEN
        ALTER TABLE experts RENAME TO expert_profiles;
    END IF;
END
$$;

-- expert_profiles 테이블에 누락된 컬럼 추가
ALTER TABLE expert_profiles 
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

-- 6. 리뷰 요청 테이블 업데이트 (review_requests)
-- 누락된 컬럼들 추가
ALTER TABLE review_requests 
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS requested_specializations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS estimated_completion_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- expert_id 외래키 수정 (experts -> expert_profiles)
ALTER TABLE review_requests 
DROP CONSTRAINT IF EXISTS review_requests_expert_id_fkey,
ADD CONSTRAINT review_requests_expert_id_fkey 
    FOREIGN KEY (expert_id) REFERENCES expert_profiles(id) ON DELETE SET NULL;

-- 7. 리뷰 결과 테이블 업데이트 (review_results)
-- expert_id 외래키 수정
ALTER TABLE review_results 
DROP CONSTRAINT IF EXISTS review_results_expert_id_fkey,
ADD CONSTRAINT review_results_expert_id_fkey 
    FOREIGN KEY (expert_id) REFERENCES expert_profiles(id) ON DELETE CASCADE;

-- 누락된 컬럼들 추가
ALTER TABLE review_results 
ADD COLUMN IF NOT EXISTS result_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 8. 알림 테이블 업데이트 (notifications)
-- 누락된 컬럼들 추가
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 9. 특기 분야 테이블 업데이트 (specialization_categories)
-- 누락된 컬럼들 추가
ALTER TABLE specialization_categories 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 10. 통계 테이블 (statistics)
CREATE TABLE IF NOT EXISTS statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    date_period DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(metric_name, category, date_period, period_type)
);

-- 11. 감사 로그 테이블 (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 시스템 설정 테이블 (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_attachments_user_id ON file_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_related_id ON file_attachments(related_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_category ON file_attachments(category);
CREATE INDEX IF NOT EXISTS idx_file_attachments_scan_status ON file_attachments(scan_status);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_statistics_metric_name ON statistics(metric_name);
CREATE INDEX IF NOT EXISTS idx_statistics_date_period ON statistics(date_period);
CREATE INDEX IF NOT EXISTS idx_statistics_category ON statistics(category);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- RLS 정책 활성화
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 결제 테이블 RLS 정책
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (true); -- 시스템에서 업데이트 필요

-- 파일 첨부 테이블 RLS 정책
CREATE POLICY "Users can view their own files" ON file_attachments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own files" ON file_attachments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON file_attachments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON file_attachments
    FOR DELETE USING (auth.uid() = user_id);

-- 사용자 역할 테이블 RLS 정책
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

-- 사용자 설정 테이블 RLS 정책
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- 통계 테이블 RLS 정책
CREATE POLICY "Admins can view all statistics" ON statistics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

-- 감사 로그 테이블 RLS 정책
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

-- 시스템 설정 테이블 RLS 정책
CREATE POLICY "Everyone can view public settings" ON system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

-- 업데이트 트리거 추가
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_attachments_updated_at
    BEFORE UPDATE ON file_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at
    BEFORE UPDATE ON statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 알림 생성 함수 업데이트
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data, priority)
    VALUES (p_user_id, p_type, p_title, p_message, p_data, p_priority)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 감사 로그 생성 함수
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_action TEXT,
    p_table_name TEXT,
    p_record_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (p_user_id, p_action, p_table_name, p_record_id, p_old_values, p_new_values)
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_statistics(
    p_metric_name TEXT,
    p_metric_value DECIMAL,
    p_category TEXT,
    p_subcategory TEXT DEFAULT NULL,
    p_date_period DATE DEFAULT CURRENT_DATE,
    p_period_type TEXT DEFAULT 'daily'
)
RETURNS UUID AS $$
DECLARE
    stat_id UUID;
BEGIN
    INSERT INTO statistics (metric_name, metric_value, category, subcategory, date_period, period_type)
    VALUES (p_metric_name, p_metric_value, p_category, p_subcategory, p_date_period, p_period_type)
    ON CONFLICT (metric_name, category, date_period, period_type)
    DO UPDATE SET 
        metric_value = EXCLUDED.metric_value,
        updated_at = NOW()
    RETURNING id INTO stat_id;
    
    RETURN stat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 설정 초기화 함수
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 기본 사용자 역할 부여
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 시 자동으로 설정 초기화
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_settings();

-- 기본 시스템 설정 데이터 삽입
INSERT INTO system_settings (key, value, description, is_public, category) VALUES
('site_name', '"K-Xpert"', 'Site name', true, 'general'),
('site_description', '"전문가 경력 검증 플랫폼"', 'Site description', true, 'general'),
('maintenance_mode', 'false', 'Maintenance mode toggle', false, 'system'),
('registration_enabled', 'true', 'User registration enabled', true, 'auth'),
('expert_application_enabled', 'true', 'Expert application enabled', true, 'expert'),
('payment_enabled', 'true', 'Payment system enabled', true, 'payment'),
('file_upload_max_size', '52428800', 'Maximum file upload size in bytes (50MB)', false, 'upload'),
('supported_file_types', '["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]', 'Supported file types', false, 'upload'),
('review_fee_normal', '50000', 'Normal review fee in KRW', true, 'pricing'),
('review_fee_high', '75000', 'High priority review fee in KRW', true, 'pricing'),
('review_fee_urgent', '100000', 'Urgent review fee in KRW', true, 'pricing')
ON CONFLICT (key) DO NOTHING;

-- 기본 관리자 역할 부여 (첫 번째 사용자가 관리자가 되도록)
-- 실제 배포 시에는 특정 이메일로 수정 필요
INSERT INTO user_roles (user_id, role, granted_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'admin@k-xpert.co.kr'
ON CONFLICT DO NOTHING;