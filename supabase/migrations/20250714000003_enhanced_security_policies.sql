-- Enhanced Security Policies for Career Verification Platform

-- 1. 기존 RLS 정책 업데이트 (expert_profiles 테이블)
-- 기존 정책 삭제 후 새로운 정책 생성
DROP POLICY IF EXISTS "Experts can view their own profile" ON expert_profiles;
DROP POLICY IF EXISTS "Experts can update their own profile" ON expert_profiles;
DROP POLICY IF EXISTS "Anyone can view approved experts" ON expert_profiles;
DROP POLICY IF EXISTS "Users can apply to become experts" ON expert_profiles;

-- 전문가 프로필 새로운 RLS 정책
CREATE POLICY "Users can view their own expert profile" ON expert_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending profile" ON expert_profiles
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND status IN ('pending', 'rejected')
    );

CREATE POLICY "Public can view approved expert profiles" ON expert_profiles
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create expert profile" ON expert_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all expert profiles" ON expert_profiles
    FOR SELECT USING (current_user_has_role('admin'));

CREATE POLICY "Admins can update expert profiles" ON expert_profiles
    FOR UPDATE USING (current_user_has_role('admin'));

-- 2. 리뷰 요청 테이블 RLS 정책 업데이트
DROP POLICY IF EXISTS "Users can view their own review requests" ON review_requests;
DROP POLICY IF EXISTS "Experts can view assigned requests" ON review_requests;
DROP POLICY IF EXISTS "Users can create review requests" ON review_requests;
DROP POLICY IF EXISTS "Experts can update assigned requests" ON review_requests;

-- 리뷰 요청 새로운 RLS 정책
CREATE POLICY "Users can view their own review requests" ON review_requests
    FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Experts can view their assigned requests" ON review_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expert_profiles ep
            WHERE ep.id = review_requests.expert_id 
            AND ep.user_id = auth.uid()
            AND ep.status = 'approved'
        )
    );

CREATE POLICY "Approved experts can view available requests" ON review_requests
    FOR SELECT USING (
        status = 'pending_assignment'
        AND payment_status = 'paid'
        AND expert_id IS NULL
        AND EXISTS (
            SELECT 1 FROM expert_profiles ep
            WHERE ep.user_id = auth.uid()
            AND ep.status = 'approved'
            AND ep.specializations && requested_specializations
        )
    );

CREATE POLICY "Users can create review requests" ON review_requests
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id
        AND EXISTS (
            SELECT 1 FROM careers c
            WHERE c.id = career_id
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Experts can update their assigned requests" ON review_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM expert_profiles ep
            WHERE ep.id = review_requests.expert_id 
            AND ep.user_id = auth.uid()
            AND ep.status = 'approved'
        )
    );

CREATE POLICY "Users can cancel their pending requests" ON review_requests
    FOR UPDATE USING (
        auth.uid() = requester_id
        AND status IN ('pending_payment', 'pending_assignment')
    );

CREATE POLICY "Admins can view all review requests" ON review_requests
    FOR SELECT USING (current_user_has_role('admin'));

CREATE POLICY "Admins can update review requests" ON review_requests
    FOR UPDATE USING (current_user_has_role('admin'));

-- 3. 리뷰 결과 테이블 RLS 정책 업데이트
DROP POLICY IF EXISTS "Users can view results for their requests" ON review_results;
DROP POLICY IF EXISTS "Experts can view and manage their results" ON review_results;

CREATE POLICY "Users can view results for their requests" ON review_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM review_requests rr
            WHERE rr.id = review_results.review_request_id 
            AND rr.requester_id = auth.uid()
        )
    );

CREATE POLICY "Experts can manage their review results" ON review_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM expert_profiles ep
            WHERE ep.id = review_results.expert_id 
            AND ep.user_id = auth.uid()
            AND ep.status = 'approved'
        )
    );

CREATE POLICY "Admins can view all review results" ON review_results
    FOR SELECT USING (current_user_has_role('admin'));

-- 4. 알림 테이블 RLS 정책 업데이트
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- 시스템 함수에서 생성

-- 5. 특기 분야 테이블 RLS 정책
ALTER TABLE specialization_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active specializations" ON specialization_categories
    FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage specializations" ON specialization_categories
    FOR ALL USING (current_user_has_role('admin'));

-- 6. 향상된 보안 정책

-- 시간 기반 접근 제어 (업무 시간 외 관리자 기능 제한)
CREATE OR REPLACE FUNCTION is_business_hours()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Seoul') BETWEEN 9 AND 18
        AND EXTRACT(DOW FROM NOW()) BETWEEN 1 AND 5; -- 월-금
END;
$$ LANGUAGE plpgsql;

-- IP 기반 접근 제어 (관리자 기능)
CREATE OR REPLACE FUNCTION is_allowed_ip()
RETURNS BOOLEAN AS $$
BEGIN
    -- 실제 운영 환경에서는 허용된 IP 목록을 확인
    -- 현재는 모든 IP 허용
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 관리자 액션에 대한 추가 보안 정책
CREATE POLICY "Admins business hours restriction" ON expert_profiles
    FOR UPDATE USING (
        current_user_has_role('admin')
        AND (
            current_user_has_role('super_admin')
            OR is_business_hours()
        )
        AND is_allowed_ip()
    );

-- 7. 데이터 암호화 및 민감 정보 보호

-- 민감한 정보 마스킹 함수
CREATE OR REPLACE FUNCTION mask_sensitive_data(
    p_data TEXT,
    p_mask_type TEXT DEFAULT 'email'
)
RETURNS TEXT AS $$
BEGIN
    CASE p_mask_type
        WHEN 'email' THEN
            RETURN regexp_replace(p_data, '(.{2}).*@(.*)\.(.*)$', '\1***@\2.\3');
        WHEN 'phone' THEN
            RETURN regexp_replace(p_data, '(.{3})(.*)(.{4})$', '\1***\3');
        WHEN 'name' THEN
            RETURN left(p_data, 1) || repeat('*', length(p_data) - 1);
        ELSE
            RETURN '***';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 8. 레이트 리미팅 테이블 및 함수
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    action TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_address ON rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON rate_limits(action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- 레이트 리미팅 함수
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_ip_address INET,
    p_action TEXT,
    p_limit INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_count INTEGER;
    v_is_blocked BOOLEAN;
BEGIN
    -- 현재 블록 상태 확인
    SELECT blocked_until > NOW() INTO v_is_blocked
    FROM rate_limits
    WHERE (user_id = p_user_id OR ip_address = p_ip_address)
        AND action = p_action
        AND blocked_until IS NOT NULL
    ORDER BY blocked_until DESC
    LIMIT 1;
    
    IF v_is_blocked THEN
        RETURN FALSE;
    END IF;
    
    -- 현재 윈도우 내 시도 횟수 확인
    SELECT COUNT(*) INTO v_current_count
    FROM rate_limits
    WHERE (user_id = p_user_id OR ip_address = p_ip_address)
        AND action = p_action
        AND window_start > NOW() - INTERVAL '1 minute' * p_window_minutes;
    
    IF v_current_count >= p_limit THEN
        -- 블록 설정
        INSERT INTO rate_limits (user_id, ip_address, action, attempt_count, blocked_until)
        VALUES (p_user_id, p_ip_address, p_action, v_current_count + 1, NOW() + INTERVAL '1 hour')
        ON CONFLICT (user_id, ip_address, action) DO UPDATE SET
            attempt_count = rate_limits.attempt_count + 1,
            blocked_until = NOW() + INTERVAL '1 hour',
            updated_at = NOW();
        
        RETURN FALSE;
    END IF;
    
    -- 시도 기록
    INSERT INTO rate_limits (user_id, ip_address, action, attempt_count)
    VALUES (p_user_id, p_ip_address, p_action, 1)
    ON CONFLICT (user_id, ip_address, action) DO UPDATE SET
        attempt_count = rate_limits.attempt_count + 1,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 데이터 보관 및 정리 정책

-- 데이터 보관 정책 테이블
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    cleanup_column TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_cleanup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 데이터 보관 정책
INSERT INTO data_retention_policies (table_name, retention_days, cleanup_column) VALUES
('audit_logs', 365, 'created_at'),
('notifications', 180, 'created_at'),
('rate_limits', 30, 'created_at'),
('payments', 2555, 'created_at'), -- 7년 (법적 요구사항)
('file_attachments', 1095, 'created_at') -- 3년
ON CONFLICT DO NOTHING;

-- 데이터 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TEXT AS $$
DECLARE
    v_policy RECORD;
    v_deleted_count INTEGER;
    v_total_deleted INTEGER := 0;
    v_result TEXT := '';
BEGIN
    FOR v_policy IN SELECT * FROM data_retention_policies WHERE is_active = true LOOP
        EXECUTE format(
            'DELETE FROM %I WHERE %I < NOW() - INTERVAL ''%s days''',
            v_policy.table_name,
            v_policy.cleanup_column,
            v_policy.retention_days
        );
        
        GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
        v_total_deleted := v_total_deleted + v_deleted_count;
        
        v_result := v_result || format('Deleted %s rows from %s; ', v_deleted_count, v_policy.table_name);
        
        -- 마지막 정리 시간 업데이트
        UPDATE data_retention_policies
        SET last_cleanup = NOW()
        WHERE id = v_policy.id;
    END LOOP;
    
    RETURN format('Total deleted: %s rows. Details: %s', v_total_deleted, v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 보안 이벤트 모니터링

-- 보안 이벤트 테이블
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- 보안 이벤트 로깅 함수
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_severity TEXT,
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO security_events (event_type, severity, user_id, ip_address, user_agent, event_data)
    VALUES (p_event_type, p_severity, p_user_id, p_ip_address, p_user_agent, p_event_data)
    RETURNING id INTO v_event_id;
    
    -- 높은 위험도 이벤트의 경우 즉시 알림
    IF p_severity IN ('high', 'critical') THEN
        -- 관리자들에게 보안 알림 전송
        INSERT INTO notifications (user_id, type, title, message, data, priority)
        SELECT ur.user_id, 'security_alert', 
               format('보안 이벤트: %s', p_event_type),
               format('심각도: %s', p_severity),
               p_event_data,
               'high'
        FROM user_roles ur
        WHERE ur.role IN ('admin', 'super_admin') AND ur.is_active = true;
    END IF;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 추가 보안 함수

-- 비밀번호 정책 확인 함수
CREATE OR REPLACE FUNCTION validate_password_policy(p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN length(p_password) >= 8
        AND p_password ~ '[A-Z]'  -- 대문자
        AND p_password ~ '[a-z]'  -- 소문자
        AND p_password ~ '[0-9]'  -- 숫자
        AND p_password ~ '[^A-Za-z0-9]'; -- 특수문자
END;
$$ LANGUAGE plpgsql;

-- 의심스러운 활동 감지 함수
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    p_user_id UUID,
    p_action TEXT,
    p_ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_recent_actions INTEGER;
    v_different_ips INTEGER;
    v_is_suspicious BOOLEAN := FALSE;
BEGIN
    -- 최근 5분간 동일한 액션 수 확인
    SELECT COUNT(*) INTO v_recent_actions
    FROM audit_logs
    WHERE user_id = p_user_id
        AND action = p_action
        AND created_at > NOW() - INTERVAL '5 minutes';
    
    -- 최근 1시간간 다른 IP 수 확인
    SELECT COUNT(DISTINCT ip_address) INTO v_different_ips
    FROM audit_logs
    WHERE user_id = p_user_id
        AND created_at > NOW() - INTERVAL '1 hour'
        AND ip_address IS NOT NULL;
    
    -- 의심스러운 활동 판단
    IF v_recent_actions > 10 OR v_different_ips > 3 THEN
        v_is_suspicious := TRUE;
        
        -- 보안 이벤트 로깅
        PERFORM log_security_event(
            'suspicious_activity',
            'medium',
            p_user_id,
            p_ip_address,
            NULL,
            json_build_object(
                'action', p_action,
                'recent_actions', v_recent_actions,
                'different_ips', v_different_ips
            )::jsonb
        );
    END IF;
    
    RETURN v_is_suspicious;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 정책 적용
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능한 테이블들
CREATE POLICY "Admins only access rate_limits" ON rate_limits
    FOR ALL USING (current_user_has_role('admin'));

CREATE POLICY "Admins only access data_retention_policies" ON data_retention_policies
    FOR ALL USING (current_user_has_role('admin'));

CREATE POLICY "Admins only access security_events" ON security_events
    FOR ALL USING (current_user_has_role('admin'));

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION has_role TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_has_role TO authenticated;
GRANT EXECUTE ON FUNCTION mask_sensitive_data TO authenticated;
GRANT EXECUTE ON FUNCTION validate_password_policy TO authenticated;