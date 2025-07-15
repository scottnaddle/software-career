-- Realtime and Webhooks Setup for Career Verification Platform

-- 1. 실시간 기능 활성화

-- 실시간 구독이 필요한 테이블들에 대한 설정
ALTER publication supabase_realtime ADD TABLE notifications;
ALTER publication supabase_realtime ADD TABLE review_requests;
ALTER publication supabase_realtime ADD TABLE review_results;
ALTER publication supabase_realtime ADD TABLE expert_profiles;
ALTER publication supabase_realtime ADD TABLE payments;
ALTER publication supabase_realtime ADD TABLE file_attachments;

-- 2. 웹훅 이벤트 테이블
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    webhook_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    response_status INTEGER,
    response_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_next_attempt_at ON webhook_events(next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- 3. 웹훅 구독 테이블
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    event_types TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_triggered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_user_id ON webhook_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_is_active ON webhook_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_event_types ON webhook_subscriptions USING GIN(event_types);

-- 4. 실시간 알림 채널 설정
CREATE TABLE IF NOT EXISTS realtime_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 실시간 채널들
INSERT INTO realtime_channels (channel_name, description) VALUES
('notifications', 'User notifications channel'),
('review_updates', 'Review request status updates'),
('expert_updates', 'Expert profile updates'),
('payment_updates', 'Payment status updates'),
('file_updates', 'File upload/download updates'),
('system_alerts', 'System-wide alerts')
ON CONFLICT (channel_name) DO NOTHING;

-- 5. 웹훅 생성 함수
CREATE OR REPLACE FUNCTION create_webhook_event(
    p_event_type TEXT,
    p_event_data JSONB,
    p_webhook_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_webhook_id UUID;
    v_subscription RECORD;
BEGIN
    -- 특정 웹훅 URL이 지정된 경우
    IF p_webhook_url IS NOT NULL THEN
        INSERT INTO webhook_events (event_type, event_data, webhook_url)
        VALUES (p_event_type, p_event_data, p_webhook_url)
        RETURNING id INTO v_webhook_id;
        
        RETURN v_webhook_id;
    END IF;
    
    -- 구독자들에게 웹훅 이벤트 생성
    FOR v_subscription IN 
        SELECT * FROM webhook_subscriptions 
        WHERE is_active = true 
        AND p_event_type = ANY(event_types)
    LOOP
        INSERT INTO webhook_events (event_type, event_data, webhook_url)
        VALUES (p_event_type, p_event_data, v_subscription.webhook_url);
    END LOOP;
    
    RETURN v_webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 실시간 알림 전송 함수
CREATE OR REPLACE FUNCTION send_realtime_notification(
    p_channel TEXT,
    p_event TEXT,
    p_payload JSONB
)
RETURNS VOID AS $$
BEGIN
    -- Supabase 실시간 채널로 알림 전송
    PERFORM pg_notify(
        'realtime:' || p_channel,
        json_build_object(
            'event', p_event,
            'payload', p_payload,
            'timestamp', NOW()
        )::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 트리거 함수들

-- 알림 실시간 전송 트리거
CREATE OR REPLACE FUNCTION notify_realtime_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- 실시간 알림 전송
    PERFORM send_realtime_notification(
        'notifications',
        'new_notification',
        json_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'type', NEW.type,
            'title', NEW.title,
            'message', NEW.message,
            'data', NEW.data,
            'priority', NEW.priority,
            'created_at', NEW.created_at
        )::jsonb
    );
    
    -- 웹훅 이벤트 생성
    PERFORM create_webhook_event(
        'notification.created',
        json_build_object(
            'notification_id', NEW.id,
            'user_id', NEW.user_id,
            'type', NEW.type,
            'title', NEW.title,
            'message', NEW.message,
            'priority', NEW.priority
        )::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 리뷰 요청 상태 변경 트리거
CREATE OR REPLACE FUNCTION notify_review_request_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 변경된 경우에만 알림
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- 실시간 알림 전송
        PERFORM send_realtime_notification(
            'review_updates',
            'status_changed',
            json_build_object(
                'id', NEW.id,
                'career_id', NEW.career_id,
                'requester_id', NEW.requester_id,
                'expert_id', NEW.expert_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'updated_at', NEW.updated_at
            )::jsonb
        );
        
        -- 웹훅 이벤트 생성
        PERFORM create_webhook_event(
            'review_request.status_changed',
            json_build_object(
                'review_request_id', NEW.id,
                'career_id', NEW.career_id,
                'requester_id', NEW.requester_id,
                'expert_id', NEW.expert_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'priority', NEW.priority
            )::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 결제 상태 변경 트리거
CREATE OR REPLACE FUNCTION notify_payment_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 변경된 경우에만 알림
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- 실시간 알림 전송
        PERFORM send_realtime_notification(
            'payment_updates',
            'status_changed',
            json_build_object(
                'id', NEW.id,
                'user_id', NEW.user_id,
                'order_id', NEW.order_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'amount', NEW.amount,
                'provider', NEW.provider,
                'updated_at', NEW.updated_at
            )::jsonb
        );
        
        -- 웹훅 이벤트 생성
        PERFORM create_webhook_event(
            'payment.status_changed',
            json_build_object(
                'payment_id', NEW.id,
                'user_id', NEW.user_id,
                'order_id', NEW.order_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'amount', NEW.amount,
                'provider', NEW.provider
            )::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 전문가 프로필 상태 변경 트리거
CREATE OR REPLACE FUNCTION notify_expert_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 변경된 경우에만 알림
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- 실시간 알림 전송
        PERFORM send_realtime_notification(
            'expert_updates',
            'status_changed',
            json_build_object(
                'id', NEW.id,
                'user_id', NEW.user_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'company', NEW.company,
                'updated_at', NEW.updated_at
            )::jsonb
        );
        
        -- 웹훅 이벤트 생성
        PERFORM create_webhook_event(
            'expert_profile.status_changed',
            json_build_object(
                'expert_profile_id', NEW.id,
                'user_id', NEW.user_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'company', NEW.company,
                'specializations', NEW.specializations
            )::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 생성
CREATE TRIGGER notification_realtime_trigger
    AFTER INSERT ON notifications
    FOR EACH ROW EXECUTE FUNCTION notify_realtime_notification();

CREATE TRIGGER review_request_update_trigger
    AFTER UPDATE ON review_requests
    FOR EACH ROW EXECUTE FUNCTION notify_review_request_update();

CREATE TRIGGER payment_update_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION notify_payment_update();

CREATE TRIGGER expert_profile_update_trigger
    AFTER UPDATE ON expert_profiles
    FOR EACH ROW EXECUTE FUNCTION notify_expert_profile_update();

-- 9. 이메일 큐 시스템
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    sender_email TEXT DEFAULT 'noreply@k-xpert.co.kr',
    sender_name TEXT DEFAULT 'K-Xpert',
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    template_name TEXT,
    template_data JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_next_attempt_at ON email_queue(next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);

-- 이메일 큐 함수
CREATE OR REPLACE FUNCTION queue_email(
    p_recipient_email TEXT,
    p_recipient_name TEXT,
    p_subject TEXT,
    p_body_html TEXT,
    p_body_text TEXT DEFAULT NULL,
    p_template_name TEXT DEFAULT NULL,
    p_template_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_email_id UUID;
BEGIN
    INSERT INTO email_queue (
        recipient_email, recipient_name, subject, body_html, body_text,
        template_name, template_data
    )
    VALUES (
        p_recipient_email, p_recipient_name, p_subject, p_body_html, p_body_text,
        p_template_name, p_template_data
    )
    RETURNING id INTO v_email_id;
    
    RETURN v_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 푸시 알림 큐 시스템
CREATE TABLE IF NOT EXISTS push_notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT,
    badge INTEGER,
    data JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_notification_queue_user_id ON push_notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_queue_status ON push_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_push_notification_queue_next_attempt_at ON push_notification_queue(next_attempt_at);

-- 푸시 알림 큐 함수
CREATE OR REPLACE FUNCTION queue_push_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_icon TEXT DEFAULT NULL,
    p_badge INTEGER DEFAULT NULL,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO push_notification_queue (
        user_id, title, message, icon, badge, data
    )
    VALUES (
        p_user_id, p_title, p_message, p_icon, p_badge, p_data
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 실시간 대시보드 메트릭 뷰
CREATE OR REPLACE VIEW realtime_dashboard_metrics AS
SELECT 
    -- 사용자 메트릭
    (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h,
    (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
    
    -- 전문가 메트릭
    (SELECT COUNT(*) FROM expert_profiles WHERE status = 'pending') as pending_expert_applications,
    (SELECT COUNT(*) FROM expert_profiles WHERE status = 'approved') as approved_experts,
    
    -- 리뷰 메트릭
    (SELECT COUNT(*) FROM review_requests WHERE status = 'pending_assignment') as pending_review_requests,
    (SELECT COUNT(*) FROM review_requests WHERE status = 'in_progress') as in_progress_reviews,
    (SELECT COUNT(*) FROM review_requests WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours') as completed_reviews_24h,
    
    -- 결제 메트릭
    (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours') as revenue_24h,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '7 days') as revenue_7d,
    
    -- 알림 메트릭
    (SELECT COUNT(*) FROM notifications WHERE created_at > NOW() - INTERVAL '1 hour') as notifications_1h,
    (SELECT COUNT(*) FROM notifications WHERE read_at IS NULL) as unread_notifications,
    
    -- 시스템 메트릭
    (SELECT COUNT(*) FROM security_events WHERE severity IN ('high', 'critical') AND created_at > NOW() - INTERVAL '24 hours') as security_alerts_24h,
    (SELECT COUNT(*) FROM webhook_events WHERE status = 'failed') as failed_webhooks,
    (SELECT COUNT(*) FROM email_queue WHERE status = 'failed') as failed_emails,
    
    -- 업데이트 시간
    NOW() as updated_at;

-- 12. 시스템 상태 확인 함수
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT json_build_object(
        'timestamp', NOW(),
        'database', json_build_object(
            'status', 'healthy',
            'connections', (SELECT count(*) FROM pg_stat_activity),
            'slow_queries', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '30 seconds')
        ),
        'queues', json_build_object(
            'webhook_pending', (SELECT count(*) FROM webhook_events WHERE status = 'pending'),
            'webhook_failed', (SELECT count(*) FROM webhook_events WHERE status = 'failed'),
            'email_pending', (SELECT count(*) FROM email_queue WHERE status = 'pending'),
            'email_failed', (SELECT count(*) FROM email_queue WHERE status = 'failed'),
            'push_pending', (SELECT count(*) FROM push_notification_queue WHERE status = 'pending'),
            'push_failed', (SELECT count(*) FROM push_notification_queue WHERE status = 'failed')
        ),
        'security', json_build_object(
            'blocked_ips', (SELECT count(DISTINCT ip_address) FROM rate_limits WHERE blocked_until > NOW()),
            'recent_security_events', (SELECT count(*) FROM security_events WHERE created_at > NOW() - INTERVAL '1 hour'),
            'failed_login_attempts', (SELECT count(*) FROM audit_logs WHERE action = 'FAILED_LOGIN' AND created_at > NOW() - INTERVAL '1 hour')
        ),
        'storage', json_build_object(
            'total_files', (SELECT count(*) FROM file_attachments),
            'total_size_mb', (SELECT ROUND(SUM(file_size)::numeric / 1024 / 1024, 2) FROM file_attachments),
            'infected_files', (SELECT count(*) FROM file_attachments WHERE scan_status = 'infected')
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 정책 적용
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_queue ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능
CREATE POLICY "Admins can manage webhook events" ON webhook_events
    FOR ALL USING (current_user_has_role('admin'));

CREATE POLICY "Users can manage their webhook subscriptions" ON webhook_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view email queue" ON email_queue
    FOR SELECT USING (current_user_has_role('admin'));

CREATE POLICY "Users can view their push notifications" ON push_notification_queue
    FOR SELECT USING (auth.uid() = user_id);

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION create_webhook_event TO authenticated;
GRANT EXECUTE ON FUNCTION send_realtime_notification TO authenticated;
GRANT EXECUTE ON FUNCTION queue_email TO authenticated;
GRANT EXECUTE ON FUNCTION queue_push_notification TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health TO authenticated;