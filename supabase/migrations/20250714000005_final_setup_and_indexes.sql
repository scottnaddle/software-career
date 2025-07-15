-- Final Setup and Performance Optimization for Career Verification Platform

-- 1. 성능 최적화 인덱스 추가

-- 복합 인덱스 (자주 함께 사용되는 컬럼들)
CREATE INDEX IF NOT EXISTS idx_review_requests_compound ON review_requests(status, payment_status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_compound ON expert_profiles(status, specializations, rating DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_compound ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_compound ON payments(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_attachments_compound ON file_attachments(user_id, category, scan_status);

-- 부분 인덱스 (조건부 인덱스)
CREATE INDEX IF NOT EXISTS idx_review_requests_available ON review_requests(requested_at DESC) 
    WHERE status = 'pending_assignment' AND payment_status = 'paid' AND expert_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_expert_profiles_approved ON expert_profiles(rating DESC, experience_years DESC) 
    WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, created_at DESC) 
    WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(created_at DESC) 
    WHERE status = 'pending';

-- 전문 분야 검색용 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_expert_profiles_specializations_gin ON expert_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_review_requests_specializations_gin ON review_requests USING GIN(requested_specializations);

-- 전문 검색용 인덱스
CREATE INDEX IF NOT EXISTS idx_expert_profiles_search ON expert_profiles USING GIN(
    to_tsvector('korean', COALESCE(company, '') || ' ' || COALESCE(position, '') || ' ' || COALESCE(bio, ''))
);

-- 2. 통계 정보 수집 및 업데이트

-- 자동 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
BEGIN
    -- 주요 테이블들의 통계 정보 업데이트
    ANALYZE expert_profiles;
    ANALYZE review_requests;
    ANALYZE review_results;
    ANALYZE notifications;
    ANALYZE payments;
    ANALYZE file_attachments;
    ANALYZE audit_logs;
    ANALYZE security_events;
END;
$$ LANGUAGE plpgsql;

-- 3. 배치 작업 스케줄링 테이블
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name TEXT NOT NULL UNIQUE,
    job_type TEXT NOT NULL CHECK (job_type IN ('recurring', 'one_time')),
    schedule_cron TEXT, -- cron 형식 스케줄 (recurring 타입용)
    scheduled_at TIMESTAMPTZ, -- 실행 예정 시간 (one_time 타입용)
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    function_name TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run_at ON scheduled_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_job_type ON scheduled_jobs(job_type);

-- 기본 배치 작업들
INSERT INTO scheduled_jobs (job_name, job_type, schedule_cron, function_name, parameters) VALUES
('cleanup_old_data', 'recurring', '0 2 * * *', 'cleanup_old_data', '{}'),
('cleanup_old_notifications', 'recurring', '0 3 * * *', 'cleanup_old_notifications', '{}'),
('update_statistics', 'recurring', '0 4 * * *', 'update_table_statistics', '{}'),
('process_pending_webhooks', 'recurring', '*/5 * * * *', 'process_pending_webhooks', '{}'),
('process_pending_emails', 'recurring', '*/2 * * * *', 'process_pending_emails', '{}'),
('calculate_expert_ratings', 'recurring', '0 1 * * *', 'recalculate_expert_ratings', '{}'),
('generate_daily_reports', 'recurring', '0 6 * * *', 'generate_daily_reports', '{}')
ON CONFLICT (job_name) DO NOTHING;

-- 4. 성능 모니터링 뷰
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    'database_size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value,
    'Database total size' as description,
    NOW() as measured_at
UNION ALL
SELECT 
    'table_sizes' as metric,
    json_agg(
        json_build_object(
            'table', schemaname||'.'||tablename,
            'size', pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)),
            'rows', n_tup_ins - n_tup_del
        )
    )::text as value,
    'Table sizes and row counts' as description,
    NOW() as measured_at
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'slow_queries' as metric,
    COUNT(*)::text as value,
    'Number of slow queries (>5s)' as description,
    NOW() as measured_at
FROM pg_stat_activity 
WHERE state = 'active' 
    AND query_start < NOW() - INTERVAL '5 seconds'
    AND query NOT LIKE '%pg_stat_activity%'
UNION ALL
SELECT 
    'active_connections' as metric,
    COUNT(*)::text as value,
    'Number of active connections' as description,
    NOW() as measured_at
FROM pg_stat_activity 
WHERE state = 'active';

-- 5. 데이터 무결성 검증 함수
CREATE OR REPLACE FUNCTION verify_data_integrity()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- 고아 레코드 확인
    RETURN QUERY
    SELECT 'orphaned_review_requests'::TEXT as check_name,
           CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
           'Found ' || COUNT(*) || ' review requests without valid career' as details
    FROM review_requests rr
    LEFT JOIN careers c ON rr.career_id = c.id
    WHERE c.id IS NULL;
    
    RETURN QUERY
    SELECT 'orphaned_review_results'::TEXT as check_name,
           CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
           'Found ' || COUNT(*) || ' review results without valid request' as details
    FROM review_results rr
    LEFT JOIN review_requests req ON rr.review_request_id = req.id
    WHERE req.id IS NULL;
    
    RETURN QUERY
    SELECT 'orphaned_notifications'::TEXT as check_name,
           CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
           'Found ' || COUNT(*) || ' notifications without valid user' as details
    FROM notifications n
    LEFT JOIN auth.users u ON n.user_id = u.id
    WHERE u.id IS NULL;
    
    -- 데이터 일관성 확인
    RETURN QUERY
    SELECT 'expert_rating_consistency'::TEXT as check_name,
           CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
           'Found ' || COUNT(*) || ' experts with incorrect rating calculation' as details
    FROM expert_profiles ep
    LEFT JOIN (
        SELECT expert_id, 
               AVG(confidence_score::decimal / 20) as calculated_rating,
               COUNT(*) as review_count
        FROM review_results 
        GROUP BY expert_id
    ) rr ON ep.id = rr.expert_id
    WHERE (ep.rating IS DISTINCT FROM rr.calculated_rating)
        OR (ep.total_reviews IS DISTINCT FROM rr.review_count);
    
    -- 결제 상태 일관성 확인
    RETURN QUERY
    SELECT 'payment_consistency'::TEXT as check_name,
           CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
           'Found ' || COUNT(*) || ' review requests with inconsistent payment status' as details
    FROM review_requests rr
    LEFT JOIN payments p ON rr.order_id = p.order_id
    WHERE (rr.payment_status = 'paid' AND p.status != 'completed')
        OR (rr.payment_status = 'pending' AND p.status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 자동 수정 함수
CREATE OR REPLACE FUNCTION auto_fix_data_issues()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := '';
    v_count INTEGER;
BEGIN
    -- 전문가 평점 재계산
    UPDATE expert_profiles ep
    SET 
        rating = COALESCE(rr.calculated_rating, 0),
        total_reviews = COALESCE(rr.review_count, 0)
    FROM (
        SELECT expert_id, 
               AVG(confidence_score::decimal / 20) as calculated_rating,
               COUNT(*) as review_count
        FROM review_results 
        GROUP BY expert_id
    ) rr
    WHERE ep.id = rr.expert_id
        AND (ep.rating IS DISTINCT FROM rr.calculated_rating 
             OR ep.total_reviews IS DISTINCT FROM rr.review_count);
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_result := v_result || 'Fixed ' || v_count || ' expert ratings. ';
    
    -- 결제 상태 동기화
    UPDATE review_requests rr
    SET payment_status = 'paid'
    FROM payments p
    WHERE rr.order_id = p.order_id
        AND p.status = 'completed'
        AND rr.payment_status != 'paid';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_result := v_result || 'Synchronized ' || v_count || ' payment statuses. ';
    
    -- 오래된 토큰 정리
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_result := v_result || 'Cleaned up ' || v_count || ' old audit logs. ';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 백업 및 복원 지원 함수
CREATE OR REPLACE FUNCTION create_data_snapshot()
RETURNS TEXT AS $$
DECLARE
    v_snapshot_name TEXT;
    v_result TEXT;
BEGIN
    v_snapshot_name := 'snapshot_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
    
    -- 스냅샷 메타데이터 저장
    INSERT INTO system_settings (key, value, description, category)
    VALUES (
        'last_snapshot',
        json_build_object(
            'name', v_snapshot_name,
            'created_at', NOW(),
            'tables', json_build_array(
                'expert_profiles', 'review_requests', 'review_results',
                'notifications', 'payments', 'file_attachments'
            )
        )::jsonb,
        'Last data snapshot information',
        'backup'
    )
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    
    v_result := 'Created snapshot: ' || v_snapshot_name;
    
    -- 감사 로그 기록
    PERFORM create_audit_log(
        auth.uid(),
        'CREATE_SNAPSHOT',
        'system',
        null,
        null,
        json_build_object('snapshot_name', v_snapshot_name)::jsonb
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 고급 검색 함수
CREATE OR REPLACE FUNCTION search_experts(
    p_query TEXT,
    p_specializations TEXT[] DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT 0,
    p_min_experience INTEGER DEFAULT 0,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    company TEXT,
    position TEXT,
    specializations TEXT[],
    experience_years INTEGER,
    rating DECIMAL,
    total_reviews INTEGER,
    search_rank REAL
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
        ts_rank(
            to_tsvector('korean', COALESCE(ep.company, '') || ' ' || COALESCE(ep.position, '') || ' ' || COALESCE(ep.bio, '')),
            plainto_tsquery('korean', p_query)
        ) as search_rank
    FROM expert_profiles ep
    WHERE ep.status = 'approved'
        AND (p_query IS NULL OR to_tsvector('korean', COALESCE(ep.company, '') || ' ' || COALESCE(ep.position, '') || ' ' || COALESCE(ep.bio, '')) @@ plainto_tsquery('korean', p_query))
        AND (p_specializations IS NULL OR ep.specializations && p_specializations)
        AND ep.rating >= p_min_rating
        AND ep.experience_years >= p_min_experience
    ORDER BY search_rank DESC, ep.rating DESC, ep.total_reviews DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 9. 캐시 무효화 함수
CREATE OR REPLACE FUNCTION invalidate_cache(
    p_cache_key TEXT
)
RETURNS VOID AS $$
BEGIN
    -- 캐시 무효화 이벤트 발생
    PERFORM send_realtime_notification(
        'cache_invalidation',
        'invalidate',
        json_build_object(
            'cache_key', p_cache_key,
            'timestamp', NOW()
        )::jsonb
    );
    
    -- 웹훅으로 외부 캐시 시스템에 알림
    PERFORM create_webhook_event(
        'cache.invalidated',
        json_build_object(
            'cache_key', p_cache_key,
            'timestamp', NOW()
        )::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 성능 최적화 설정
-- 테이블별 통계 수집 빈도 설정
ALTER TABLE expert_profiles SET (autovacuum_analyze_scale_factor = 0.1);
ALTER TABLE review_requests SET (autovacuum_analyze_scale_factor = 0.1);
ALTER TABLE notifications SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE payments SET (autovacuum_analyze_scale_factor = 0.1);

-- 11. 최종 권한 설정
-- 뷰 권한
GRANT SELECT ON performance_metrics TO authenticated;
GRANT SELECT ON realtime_dashboard_metrics TO authenticated;

-- 함수 권한
GRANT EXECUTE ON FUNCTION verify_data_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION search_experts TO authenticated;
GRANT EXECUTE ON FUNCTION invalidate_cache TO authenticated;

-- 관리자 전용 함수
REVOKE ALL ON FUNCTION auto_fix_data_issues FROM PUBLIC;
REVOKE ALL ON FUNCTION create_data_snapshot FROM PUBLIC;
REVOKE ALL ON FUNCTION update_table_statistics FROM PUBLIC;

-- 12. 최종 데이터 검증 및 설정
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 기본 데이터 존재 확인
    SELECT COUNT(*) INTO v_count FROM specialization_categories WHERE active = true;
    IF v_count = 0 THEN
        RAISE NOTICE 'Warning: No active specialization categories found';
    END IF;
    
    SELECT COUNT(*) INTO v_count FROM system_settings WHERE is_public = true;
    IF v_count = 0 THEN
        RAISE NOTICE 'Warning: No public system settings found';
    END IF;
    
    -- 필수 인덱스 존재 확인
    SELECT COUNT(*) INTO v_count 
    FROM pg_indexes 
    WHERE tablename = 'expert_profiles' AND indexname LIKE '%specializations%';
    IF v_count = 0 THEN
        RAISE NOTICE 'Warning: Specializations index missing on expert_profiles';
    END IF;
    
    RAISE NOTICE 'Database setup completed successfully';
END
$$;

-- 13. 최종 통계 업데이트
SELECT update_table_statistics();

-- 14. 시스템 상태 확인
SELECT 'Database setup completed at: ' || NOW()::TEXT as status;

-- 데이터베이스 버전 정보 저장
INSERT INTO system_settings (key, value, description, category) VALUES
('database_version', '"1.0.0"', 'Database schema version', 'system'),
('last_migration', '"20250714000005"', 'Last applied migration', 'system'),
('setup_completed_at', ('"' || NOW()::TEXT || '"')::jsonb, 'Database setup completion time', 'system')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();