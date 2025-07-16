-- Admin Dashboard Permissions Migration
-- This migration adds necessary permissions and policies for admin dashboard functionality

-- Update RLS policies for admin access to all tables

-- Users table admin policies
DROP POLICY IF EXISTS "Admin full access to users" ON users;
CREATE POLICY "Admin full access to users"
ON users FOR ALL
USING (
    auth.uid() = id OR
    EXISTS (
        SELECT 1 FROM users admin_user
        WHERE admin_user.id = auth.uid() 
        AND admin_user.account_type = 'admin'
    )
);

-- Payments table admin policies
DROP POLICY IF EXISTS "Admin full access to payments" ON payments;
CREATE POLICY "Admin full access to payments"
ON payments FOR ALL
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM users admin_user
        WHERE admin_user.id = auth.uid() 
        AND admin_user.account_type = 'admin'
    )
);

-- Expert verifications table admin policies
DROP POLICY IF EXISTS "Admin full access to expert_verifications" ON expert_verifications;
CREATE POLICY "Admin full access to expert_verifications"
ON expert_verifications FOR ALL
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM users admin_user
        WHERE admin_user.id = auth.uid() 
        AND admin_user.account_type = 'admin'
    )
);

-- Review requests table admin policies
DROP POLICY IF EXISTS "Admin full access to review_requests" ON review_requests;
CREATE POLICY "Admin full access to review_requests"
ON review_requests FOR ALL
USING (
    auth.uid() = user_id OR
    auth.uid() = expert_id OR
    EXISTS (
        SELECT 1 FROM users admin_user
        WHERE admin_user.id = auth.uid() 
        AND admin_user.account_type = 'admin'
    )
);

-- Careers table admin policies
DROP POLICY IF EXISTS "Admin full access to careers" ON careers;
CREATE POLICY "Admin full access to careers"
ON careers FOR ALL
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM users admin_user
        WHERE admin_user.id = auth.uid() 
        AND admin_user.account_type = 'admin'
    )
);

-- Create admin dashboard statistics function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_users INTEGER,
    pending_experts INTEGER,
    approved_experts INTEGER,
    rejected_experts INTEGER,
    total_payments INTEGER,
    pending_payments INTEGER,
    completed_payments INTEGER,
    failed_payments INTEGER,
    monthly_revenue NUMERIC,
    active_reviews INTEGER,
    pending_reviews INTEGER,
    completed_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM users) as total_users,
        (SELECT COUNT(*)::INTEGER FROM expert_verifications WHERE status = 'pending') as pending_experts,
        (SELECT COUNT(*)::INTEGER FROM expert_verifications WHERE status = 'verified') as approved_experts,
        (SELECT COUNT(*)::INTEGER FROM expert_verifications WHERE status = 'rejected') as rejected_experts,
        (SELECT COUNT(*)::INTEGER FROM payments WHERE status = 'completed') as total_payments,
        (SELECT COUNT(*)::INTEGER FROM payments WHERE status = 'pending') as pending_payments,
        (SELECT COUNT(*)::INTEGER FROM payments WHERE status = 'completed') as completed_payments,
        (SELECT COUNT(*)::INTEGER FROM payments WHERE status = 'failed') as failed_payments,
        (SELECT COALESCE(SUM(amount), 0) FROM payments 
         WHERE status = 'completed' 
         AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue,
        (SELECT COUNT(*)::INTEGER FROM review_requests WHERE status = 'in_progress') as active_reviews,
        (SELECT COUNT(*)::INTEGER FROM review_requests WHERE status IN ('assigned', 'in_progress')) as pending_reviews,
        (SELECT COUNT(*)::INTEGER FROM review_requests WHERE status = 'completed') as completed_reviews;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent admin activities
CREATE OR REPLACE FUNCTION get_recent_admin_activities(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    activity_type TEXT,
    activity_description TEXT,
    user_name TEXT,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'user_registration' as activity_type,
        'New user registered' as activity_description,
        u.name as user_name,
        u.email as user_email,
        u.created_at,
        jsonb_build_object(
            'account_type', u.account_type,
            'verified', u.verified,
            'company', u.company
        ) as metadata
    FROM users u
    WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'expert_application' as activity_type,
        'Expert verification requested' as activity_description,
        u.name as user_name,
        u.email as user_email,
        ev.created_at,
        jsonb_build_object(
            'status', ev.status,
            'specialties', ev.specialties,
            'rate', ev.rate
        ) as metadata
    FROM expert_verifications ev
    JOIN users u ON ev.user_id = u.id
    WHERE ev.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'payment_completed' as activity_type,
        'Payment completed' as activity_description,
        u.name as user_name,
        u.email as user_email,
        p.created_at,
        jsonb_build_object(
            'amount', p.amount,
            'payment_method', p.payment_method,
            'type', p.type
        ) as metadata
    FROM payments p
    JOIN users u ON p.user_id = u.id
    WHERE p.status = 'completed' AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
    
    ORDER BY created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle admin actions logging
CREATE OR REPLACE FUNCTION log_admin_action(
    admin_id UUID,
    action_type TEXT,
    target_table TEXT,
    target_id UUID,
    old_values JSONB DEFAULT NULL,
    new_values JSONB DEFAULT NULL,
    description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        changes,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        admin_id,
        action_type,
        target_table,
        target_id,
        CASE 
            WHEN old_values IS NOT NULL AND new_values IS NOT NULL THEN
                jsonb_build_object(
                    'old', old_values,
                    'new', new_values,
                    'description', description
                )
            ELSE
                jsonb_build_object('description', description)
        END,
        '127.0.0.1', -- This should be replaced with actual IP in production
        'Admin Dashboard',
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to admin functions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_admin_activities(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(UUID, TEXT, TEXT, UUID, JSONB, JSONB, TEXT) TO authenticated;

-- Create admin dashboard summary view
CREATE OR REPLACE VIEW admin_dashboard_summary AS
SELECT 
    'system_health' as metric_type,
    jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'active_users_today', (SELECT COUNT(*) FROM users WHERE last_sign_in_at >= CURRENT_DATE),
        'pending_expert_applications', (SELECT COUNT(*) FROM expert_verifications WHERE status = 'pending'),
        'pending_reviews', (SELECT COUNT(*) FROM review_requests WHERE status IN ('assigned', 'in_progress')),
        'pending_payments', (SELECT COUNT(*) FROM payments WHERE status = 'pending'),
        'daily_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE),
        'monthly_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))
    ) as metrics,
    NOW() as calculated_at;

-- Grant access to admin dashboard view
GRANT SELECT ON admin_dashboard_summary TO authenticated;

-- Create RLS policy for admin dashboard view
CREATE POLICY "Admin dashboard summary access"
ON admin_dashboard_summary FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND account_type = 'admin'
    )
);

-- Create trigger to log admin actions
CREATE OR REPLACE FUNCTION trigger_log_admin_actions()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if the action is performed by an admin
    IF EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND account_type = 'admin') THEN
        IF TG_OP = 'UPDATE' THEN
            PERFORM log_admin_action(
                auth.uid(),
                'UPDATE',
                TG_TABLE_NAME,
                NEW.id,
                to_jsonb(OLD),
                to_jsonb(NEW),
                'Admin dashboard update'
            );
        ELSIF TG_OP = 'DELETE' THEN
            PERFORM log_admin_action(
                auth.uid(),
                'DELETE',
                TG_TABLE_NAME,
                OLD.id,
                to_jsonb(OLD),
                NULL,
                'Admin dashboard delete'
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add triggers to important tables
DROP TRIGGER IF EXISTS admin_action_log_users ON users;
CREATE TRIGGER admin_action_log_users
    AFTER UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_admin_actions();

DROP TRIGGER IF EXISTS admin_action_log_payments ON payments;
CREATE TRIGGER admin_action_log_payments
    AFTER UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_admin_actions();

DROP TRIGGER IF EXISTS admin_action_log_expert_verifications ON expert_verifications;
CREATE TRIGGER admin_action_log_expert_verifications
    AFTER UPDATE OR DELETE ON expert_verifications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_admin_actions();

-- Create notification for admin when important events occur
CREATE OR REPLACE FUNCTION notify_admin_of_important_events()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'expert_verifications' AND TG_OP = 'INSERT' THEN
        -- Notify admin of new expert application
        INSERT INTO notifications (user_id, type, title, message, data)
        SELECT 
            u.id,
            'expert_application',
            '새로운 전문가 신청',
            format('새로운 전문가 신청이 있습니다: %s', (SELECT name FROM users WHERE id = NEW.user_id)),
            jsonb_build_object(
                'expert_verification_id', NEW.id,
                'user_id', NEW.user_id,
                'specialties', NEW.specialties
            )
        FROM users u
        WHERE u.account_type = 'admin';
    END IF;
    
    IF TG_TABLE_NAME = 'payments' AND TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
        -- Notify admin of completed payment
        INSERT INTO notifications (user_id, type, title, message, data)
        SELECT 
            u.id,
            'payment_completed',
            '결제 완료',
            format('결제가 완료되었습니다: %s원', NEW.amount),
            jsonb_build_object(
                'payment_id', NEW.id,
                'amount', NEW.amount,
                'user_id', NEW.user_id
            )
        FROM users u
        WHERE u.account_type = 'admin';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add notification triggers
DROP TRIGGER IF EXISTS notify_admin_expert_applications ON expert_verifications;
CREATE TRIGGER notify_admin_expert_applications
    AFTER INSERT ON expert_verifications
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_of_important_events();

DROP TRIGGER IF EXISTS notify_admin_payments ON payments;
CREATE TRIGGER notify_admin_payments
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_of_important_events();

-- Comment for documentation
COMMENT ON FUNCTION get_admin_dashboard_stats IS 'Returns comprehensive dashboard statistics for admin interface';
COMMENT ON FUNCTION get_recent_admin_activities IS 'Returns recent system activities for admin monitoring';
COMMENT ON FUNCTION log_admin_action IS 'Logs admin actions for audit trail';
COMMENT ON VIEW admin_dashboard_summary IS 'Real-time dashboard summary for admin interface';