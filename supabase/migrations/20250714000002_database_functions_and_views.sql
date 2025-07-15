-- Database Functions and Views for Career Verification Platform

-- 1. 전문가 통계 계산 뷰
CREATE OR REPLACE VIEW expert_statistics AS
SELECT 
    ep.id,
    ep.user_id,
    ep.company,
    ep.position,
    ep.specializations,
    ep.experience_years,
    ep.rating,
    ep.total_reviews,
    ep.status,
    ep.created_at,
    -- 리뷰 통계
    COALESCE(review_stats.total_requests, 0) as total_requests,
    COALESCE(review_stats.completed_requests, 0) as completed_requests,
    COALESCE(review_stats.pending_requests, 0) as pending_requests,
    COALESCE(review_stats.total_earnings, 0) as total_earnings,
    COALESCE(review_stats.avg_completion_time, 0) as avg_completion_time_hours,
    COALESCE(review_stats.this_month_reviews, 0) as this_month_reviews,
    COALESCE(review_stats.this_month_earnings, 0) as this_month_earnings
FROM expert_profiles ep
LEFT JOIN (
    SELECT 
        expert_id,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status IN ('assigned', 'in_progress') THEN 1 END) as pending_requests,
        SUM(CASE WHEN status = 'completed' THEN review_fee ELSE 0 END) as total_earnings,
        AVG(
            CASE 
                WHEN status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600
                ELSE NULL
            END
        ) as avg_completion_time,
        COUNT(CASE 
            WHEN status = 'completed' 
            AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_DATE)
            THEN 1 
        END) as this_month_reviews,
        SUM(CASE 
            WHEN status = 'completed' 
            AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_DATE)
            THEN review_fee 
            ELSE 0 
        END) as this_month_earnings
    FROM review_requests rr
    JOIN expert_profiles ep ON rr.expert_id = ep.id
    GROUP BY expert_id
) review_stats ON ep.id = review_stats.expert_id;

-- 2. 리뷰 요청 상세 뷰
CREATE OR REPLACE VIEW review_request_details AS
SELECT 
    rr.id,
    rr.career_id,
    rr.requester_id,
    rr.expert_id,
    rr.status,
    rr.priority,
    rr.order_id,
    rr.requested_specializations,
    rr.review_fee,
    rr.payment_status,
    rr.requested_at,
    rr.assigned_at,
    rr.started_at,
    rr.completed_at,
    rr.deadline,
    rr.additional_notes,
    rr.estimated_completion_time,
    rr.completion_notes,
    -- 요청자 정보
    u.id as requester_email,
    u.email as requester_email,
    -- 전문가 정보
    ep.company as expert_company,
    ep.position as expert_position,
    ep.rating as expert_rating,
    -- 경력 정보
    c.title as career_title,
    c.company as career_company,
    c.description as career_description,
    c.technologies as career_technologies,
    c.start_date as career_start_date,
    c.end_date as career_end_date,
    -- 결제 정보
    p.status as payment_status_detail,
    p.completed_at as payment_completed_at,
    -- 리뷰 결과
    rr_result.verification_status,
    rr_result.confidence_score,
    rr_result.feedback,
    rr_result.rating as review_rating
FROM review_requests rr
LEFT JOIN auth.users u ON rr.requester_id = u.id
LEFT JOIN expert_profiles ep ON rr.expert_id = ep.id
LEFT JOIN careers c ON rr.career_id = c.id
LEFT JOIN payments p ON rr.order_id = p.order_id
LEFT JOIN review_results rr_result ON rr.id = rr_result.review_request_id;

-- 3. 전문가 가용 리뷰 요청 뷰
CREATE OR REPLACE VIEW available_review_requests AS
SELECT 
    rr.id,
    rr.career_id,
    rr.priority,
    rr.requested_specializations,
    rr.review_fee,
    rr.requested_at,
    rr.deadline,
    rr.additional_notes,
    -- 경력 정보
    c.title as career_title,
    c.company as career_company,
    c.description as career_description,
    c.technologies as career_technologies,
    c.start_date as career_start_date,
    c.end_date as career_end_date,
    -- 요청자 정보
    u.email as requester_email,
    -- 우선순위 점수 (정렬용)
    CASE 
        WHEN rr.priority = 'urgent' THEN 4
        WHEN rr.priority = 'high' THEN 3
        WHEN rr.priority = 'normal' THEN 2
        ELSE 1
    END as priority_score,
    -- 대기 시간 (정렬용)
    EXTRACT(EPOCH FROM (NOW() - rr.requested_at)) / 3600 as waiting_hours
FROM review_requests rr
JOIN careers c ON rr.career_id = c.id
JOIN auth.users u ON rr.requester_id = u.id
WHERE rr.status = 'pending_assignment'
  AND rr.payment_status = 'paid'
  AND rr.expert_id IS NULL;

-- 4. 사용자 알림 통계 뷰
CREATE OR REPLACE VIEW user_notification_stats AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_count,
    COUNT(CASE WHEN archived_at IS NOT NULL THEN 1 END) as archived_count,
    COUNT(CASE WHEN priority = 'high' AND read_at IS NULL THEN 1 END) as high_priority_unread,
    MAX(created_at) as last_notification_at
FROM notifications
GROUP BY user_id;

-- 5. 일일 플랫폼 통계 뷰
CREATE OR REPLACE VIEW daily_platform_stats AS
SELECT 
    DATE(created_at) as date,
    -- 사용자 통계
    COUNT(DISTINCT CASE WHEN table_name = 'auth.users' THEN record_id END) as new_users,
    -- 전문가 통계
    COUNT(DISTINCT CASE WHEN table_name = 'expert_profiles' AND action = 'INSERT' THEN record_id END) as new_expert_applications,
    COUNT(DISTINCT CASE WHEN table_name = 'expert_profiles' AND action = 'UPDATE' AND new_values->>'status' = 'approved' THEN record_id END) as approved_experts,
    -- 리뷰 통계
    COUNT(DISTINCT CASE WHEN table_name = 'review_requests' AND action = 'INSERT' THEN record_id END) as new_review_requests,
    COUNT(DISTINCT CASE WHEN table_name = 'review_requests' AND action = 'UPDATE' AND new_values->>'status' = 'completed' THEN record_id END) as completed_reviews,
    -- 결제 통계
    COUNT(DISTINCT CASE WHEN table_name = 'payments' AND action = 'UPDATE' AND new_values->>'status' = 'completed' THEN record_id END) as completed_payments,
    SUM(CASE WHEN table_name = 'payments' AND action = 'UPDATE' AND new_values->>'status' = 'completed' THEN (new_values->>'amount')::decimal ELSE 0 END) as total_revenue
FROM audit_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 6. 전문가 매칭 함수
CREATE OR REPLACE FUNCTION find_matching_experts(
    p_specializations TEXT[],
    p_min_rating DECIMAL DEFAULT 0.0,
    p_min_experience INTEGER DEFAULT 0,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    expert_id UUID,
    user_id UUID,
    company TEXT,
    position TEXT,
    specializations TEXT[],
    experience_years INTEGER,
    rating DECIMAL,
    total_reviews INTEGER,
    match_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ep.id,
        ep.user_id,
        ep.company,
        ep.position,
        ep.specializations,
        ep.experience_years,
        ep.rating,
        ep.total_reviews,
        -- 매칭 점수 계산
        (
            -- 전문 분야 일치도 (40%)
            (ARRAY_LENGTH(array_cat(ep.specializations, p_specializations), 1) - 
             ARRAY_LENGTH(array_cat(ep.specializations, p_specializations), 1) + 
             ARRAY_LENGTH(array_intersect(ep.specializations, p_specializations), 1)) * 0.4 +
            -- 평점 점수 (30%)
            (ep.rating / 5.0) * 0.3 +
            -- 경력 점수 (20%)
            LEAST(ep.experience_years / 10.0, 1.0) * 0.2 +
            -- 리뷰 수 점수 (10%)
            LEAST(ep.total_reviews / 50.0, 1.0) * 0.1
        ) as match_score
    FROM expert_profiles ep
    WHERE ep.status = 'approved'
        AND ep.rating >= p_min_rating
        AND ep.experience_years >= p_min_experience
        AND ep.specializations && p_specializations -- 배열 교집합 연산자
    ORDER BY match_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. 리뷰 요청 자동 배정 함수
CREATE OR REPLACE FUNCTION auto_assign_review_request(
    p_review_request_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_request_record RECORD;
    v_expert_id UUID;
    v_notification_id UUID;
BEGIN
    -- 리뷰 요청 정보 가져오기
    SELECT * INTO v_request_record
    FROM review_requests
    WHERE id = p_review_request_id
        AND status = 'pending_assignment'
        AND payment_status = 'paid'
        AND expert_id IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Review request not found or not eligible for assignment';
    END IF;
    
    -- 최적의 전문가 찾기
    SELECT expert_id INTO v_expert_id
    FROM find_matching_experts(
        v_request_record.requested_specializations,
        3.0, -- 최소 평점 3.0
        1,   -- 최소 경력 1년
        1    -- 상위 1명만
    )
    LIMIT 1;
    
    IF v_expert_id IS NULL THEN
        RAISE EXCEPTION 'No matching expert found';
    END IF;
    
    -- 리뷰 요청 배정
    UPDATE review_requests
    SET expert_id = v_expert_id,
        status = 'assigned',
        assigned_at = NOW()
    WHERE id = p_review_request_id;
    
    -- 전문가에게 알림 전송
    SELECT create_notification(
        (SELECT user_id FROM expert_profiles WHERE id = v_expert_id),
        'review_assigned',
        '새로운 리뷰 요청이 배정되었습니다',
        '새로운 경력 검토 요청이 배정되었습니다. 확인해주세요.',
        json_build_object(
            'review_request_id', p_review_request_id,
            'career_title', (SELECT title FROM careers WHERE id = v_request_record.career_id)
        )::jsonb
    ) INTO v_notification_id;
    
    -- 요청자에게 알림 전송
    SELECT create_notification(
        v_request_record.requester_id,
        'expert_assigned',
        '전문가가 배정되었습니다',
        '경력 검토에 전문가가 배정되어 곧 검토가 시작됩니다.',
        json_build_object(
            'review_request_id', p_review_request_id,
            'expert_id', v_expert_id
        )::jsonb
    ) INTO v_notification_id;
    
    RETURN v_expert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 사용자 역할 확인 함수
CREATE OR REPLACE FUNCTION has_role(
    p_user_id UUID,
    p_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = p_user_id
            AND role = p_role
            AND is_active = true
            AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 현재 사용자 역할 확인 함수
CREATE OR REPLACE FUNCTION current_user_has_role(p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_role(auth.uid(), p_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 파일 다운로드 카운터 업데이트 함수
CREATE OR REPLACE FUNCTION increment_download_count(p_file_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE file_attachments
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = p_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 전문가 프로필 승인 함수
CREATE OR REPLACE FUNCTION approve_expert_profile(
    p_expert_id UUID,
    p_reviewer_id UUID,
    p_reviewer_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_notification_id UUID;
BEGIN
    -- 전문가 프로필 승인
    UPDATE expert_profiles
    SET status = 'approved',
        approved_at = NOW(),
        approved_by = p_reviewer_id,
        reviewed_at = NOW(),
        reviewed_by = p_reviewer_id,
        reviewer_notes = p_reviewer_notes
    WHERE id = p_expert_id
    RETURNING user_id INTO v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Expert profile not found';
    END IF;
    
    -- 전문가 역할 부여
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES (v_user_id, 'expert', p_reviewer_id)
    ON CONFLICT (user_id, role) DO UPDATE SET
        granted_by = p_reviewer_id,
        granted_at = NOW(),
        is_active = true;
    
    -- 승인 알림 전송
    SELECT create_notification(
        v_user_id,
        'expert_approved',
        '전문가 신청이 승인되었습니다',
        '축하합니다! 전문가 신청이 승인되어 이제 경력 검토를 시작할 수 있습니다.',
        json_build_object('expert_id', p_expert_id)::jsonb,
        'high'
    ) INTO v_notification_id;
    
    -- 감사 로그 기록
    PERFORM create_audit_log(
        p_reviewer_id,
        'APPROVE_EXPERT',
        'expert_profiles',
        p_expert_id,
        NULL,
        json_build_object('approved_by', p_reviewer_id, 'approved_at', NOW())::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 전문가 프로필 거절 함수
CREATE OR REPLACE FUNCTION reject_expert_profile(
    p_expert_id UUID,
    p_reviewer_id UUID,
    p_rejection_reason TEXT,
    p_reviewer_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_notification_id UUID;
BEGIN
    -- 전문가 프로필 거절
    UPDATE expert_profiles
    SET status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = p_reviewer_id,
        rejection_reason = p_rejection_reason,
        reviewer_notes = p_reviewer_notes
    WHERE id = p_expert_id
    RETURNING user_id INTO v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Expert profile not found';
    END IF;
    
    -- 거절 알림 전송
    SELECT create_notification(
        v_user_id,
        'expert_rejected',
        '전문가 신청이 검토되었습니다',
        format('전문가 신청이 검토되었습니다. 사유: %s', p_rejection_reason),
        json_build_object(
            'expert_id', p_expert_id,
            'rejection_reason', p_rejection_reason
        )::jsonb,
        'high'
    ) INTO v_notification_id;
    
    -- 감사 로그 기록
    PERFORM create_audit_log(
        p_reviewer_id,
        'REJECT_EXPERT',
        'expert_profiles',
        p_expert_id,
        NULL,
        json_build_object(
            'rejected_by', p_reviewer_id,
            'rejected_at', NOW(),
            'rejection_reason', p_rejection_reason
        )::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 배열 교집합 함수 (PostgreSQL 버전에 따라 필요할 수 있음)
CREATE OR REPLACE FUNCTION array_intersect(anyarray, anyarray)
RETURNS anyarray AS $$
SELECT ARRAY(
    SELECT UNNEST($1)
    INTERSECT
    SELECT UNNEST($2)
);
$$ LANGUAGE sql IMMUTABLE;

-- 14. 시스템 설정 값 가져오기 함수
CREATE OR REPLACE FUNCTION get_system_setting(p_key TEXT)
RETURNS JSONB AS $$
DECLARE
    v_value JSONB;
BEGIN
    SELECT value INTO v_value
    FROM system_settings
    WHERE key = p_key;
    
    RETURN COALESCE(v_value, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. 배치 알림 정리 함수 (오래된 알림 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- 6개월 이상 된 읽은 알림 삭제
    DELETE FROM notifications
    WHERE read_at IS NOT NULL
        AND created_at < NOW() - INTERVAL '6 months';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- 1년 이상 된 모든 알림 삭제
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS v_deleted_count = v_deleted_count + ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 뷰에 대한 RLS 정책 (뷰는 기본적으로 기본 테이블의 정책을 따름)
-- 하지만 몇 가지 추가적인 권한 부여가 필요할 수 있음

-- 전문가 통계 뷰 권한
GRANT SELECT ON expert_statistics TO authenticated;

-- 리뷰 요청 상세 뷰 권한
GRANT SELECT ON review_request_details TO authenticated;

-- 사용자 알림 통계 뷰 권한
GRANT SELECT ON user_notification_stats TO authenticated;

-- 관리자용 뷰 권한
GRANT SELECT ON available_review_requests TO authenticated;
GRANT SELECT ON daily_platform_stats TO authenticated;