-- K-Xpert 관리자 기능 테스트에 필요한 테이블들 생성
-- 실행 전: 기존 테이블과 중복되지 않는지 확인 후 실행하세요

-- Step 1: 기존 테이블 확인
SELECT 
    'Existing Tables Check' as info,
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'expert_verifications', 
    'payments', 
    'review_requests', 
    'notifications',
    'user_settings',
    'audit_logs'
)
ORDER BY tablename;

-- Step 2: expert_verifications 테이블 생성
CREATE TABLE IF NOT EXISTS expert_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    rate INTEGER NOT NULL DEFAULT 0, -- 시간당 요금 (원)
    bio TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    experience_years INTEGER DEFAULT 0,
    education TEXT,
    certifications TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id) -- 한 사용자당 하나의 신청만 가능
);

-- Step 3: payments 테이블 생성
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL DEFAULT 0, -- 결제 금액 (원)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('toss', 'kakaopay', 'inicis', 'bank_transfer')),
    type TEXT NOT NULL CHECK (type IN ('expert_review', 'profile_verification', 'expert_certification', 'enterprise_service', 'profile_boost', 'verification_fee')),
    transaction_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    refund_amount INTEGER DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: review_requests 테이블 생성
CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expert_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    skills_required TEXT[] DEFAULT '{}',
    budget INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    deadline TIMESTAMP WITH TIME ZONE,
    review_result JSONB DEFAULT '{}',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('system', 'expert_application', 'payment_completed', 'review_request', 'admin_alert', 'profile_update')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: user_settings 테이블 생성
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
    timezone TEXT DEFAULT 'Asia/Seoul',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: audit_logs 테이블 생성 (관리자 활동 로그)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: 인덱스 생성
-- expert_verifications 인덱스
CREATE INDEX IF NOT EXISTS idx_expert_verifications_user_id ON expert_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_verifications_status ON expert_verifications(status);
CREATE INDEX IF NOT EXISTS idx_expert_verifications_created_at ON expert_verifications(created_at DESC);

-- payments 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);

-- review_requests 인덱스
CREATE INDEX IF NOT EXISTS idx_review_requests_user_id ON review_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_expert_id ON review_requests(expert_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
CREATE INDEX IF NOT EXISTS idx_review_requests_created_at ON review_requests(created_at DESC);

-- notifications 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- audit_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Step 9: RLS (Row Level Security) 정책 설정
-- expert_verifications RLS
ALTER TABLE expert_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expert verifications" ON expert_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expert verifications" ON expert_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expert verifications" ON expert_verifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all expert verifications" ON expert_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND account_type = 'admin'
        )
    );

-- payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND account_type = 'admin'
        )
    );

-- review_requests RLS
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own review requests" ON review_requests
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Users can insert own review requests" ON review_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review requests" ON review_requests
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Admins can view all review requests" ON review_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND account_type = 'admin'
        )
    );

-- notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND account_type = 'admin'
        )
    );

-- user_settings RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- audit_logs RLS (관리자만 접근)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND account_type = 'admin'
        )
    );

-- Step 10: 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 적용
CREATE TRIGGER update_expert_verifications_updated_at 
    BEFORE UPDATE ON expert_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at 
    BEFORE UPDATE ON review_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 11: 생성 완료 확인
SELECT 
    '=== 테이블 생성 완료 ===' as status,
    'expert_verifications, payments, review_requests, notifications, user_settings, audit_logs' as created_tables;

-- 생성된 테이블 목록 확인
SELECT 
    tablename as table_name,
    schemaname as schema_name,
    'Created successfully' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'expert_verifications', 
    'payments', 
    'review_requests', 
    'notifications',
    'user_settings',
    'audit_logs'
)
ORDER BY tablename;