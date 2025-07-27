-- Enhanced Row Level Security Policies for Admin Functions
-- This file contains comprehensive RLS policies to secure admin operations

-- Enable RLS on all admin-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_full_access_users" ON users;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "admin_full_access_expert_verifications" ON expert_verifications;
DROP POLICY IF EXISTS "users_can_create_expert_application" ON expert_verifications;
DROP POLICY IF EXISTS "users_can_read_own_expert_application" ON expert_verifications;
DROP POLICY IF EXISTS "admin_full_access_payments" ON payments;
DROP POLICY IF EXISTS "users_can_read_own_payments" ON payments;
DROP POLICY IF EXISTS "admin_full_access_notifications" ON notifications;
DROP POLICY IF EXISTS "users_can_read_own_notifications" ON notifications;
DROP POLICY IF EXISTS "admin_full_access_review_requests" ON review_requests;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists and is admin by email or account_type
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND (
      account_type = 'admin' 
      OR email = 'admin@k-xpert.co.kr'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's account type
CREATE OR REPLACE FUNCTION get_user_account_type(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT account_type 
    FROM users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "admin_full_access_users" ON users
  FOR ALL USING (is_admin());

CREATE POLICY "users_can_read_own_profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND account_type != 'admin'); -- Prevent users from making themselves admin

-- Expert verifications table policies
CREATE POLICY "admin_full_access_expert_verifications" ON expert_verifications
  FOR ALL USING (is_admin());

CREATE POLICY "users_can_create_expert_application" ON expert_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_read_own_expert_application" ON expert_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_pending_application" ON expert_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Payments table policies
CREATE POLICY "admin_full_access_payments" ON payments
  FOR ALL USING (is_admin());

CREATE POLICY "users_can_read_own_payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_own_payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only allow payment status updates by admin or system
CREATE POLICY "admin_can_update_payment_status" ON payments
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Notifications table policies
CREATE POLICY "admin_full_access_notifications" ON notifications
  FOR ALL USING (is_admin());

CREATE POLICY "users_can_read_own_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Review requests table policies
CREATE POLICY "admin_full_access_review_requests" ON review_requests
  FOR ALL USING (is_admin());

CREATE POLICY "users_can_create_review_requests" ON review_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_read_own_review_requests" ON review_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "experts_can_read_assigned_reviews" ON review_requests
  FOR SELECT USING (
    auth.uid() = expert_id 
    AND get_user_account_type() = 'expert'
  );

-- Security views for safe data access
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE account_type != 'admin') as total_users,
  (SELECT COUNT(*) FROM expert_verifications WHERE status = 'pending') as pending_experts,
  (SELECT COUNT(*) FROM expert_verifications WHERE status = 'verified') as approved_experts,
  (SELECT COUNT(*) FROM expert_verifications WHERE status = 'rejected') as rejected_experts,
  (SELECT COUNT(*) FROM payments WHERE status = 'completed') as total_payments,
  (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE)) as monthly_revenue,
  (SELECT COUNT(*) FROM review_requests WHERE status = 'pending') as active_reviews;

-- Grant access to admin view only for admins
GRANT SELECT ON admin_dashboard_stats TO authenticated;
CREATE POLICY "admin_can_view_dashboard_stats" ON admin_dashboard_stats
  FOR SELECT USING (is_admin());

-- Audit logging function
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the action is performed by an admin
  IF is_admin() THEN
    INSERT INTO admin_audit_log (
      admin_id,
      table_name,
      action,
      old_values,
      new_values,
      created_at
    ) VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "admin_can_read_audit_logs" ON admin_audit_log
  FOR SELECT USING (is_admin());

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS expert_verifications_audit ON expert_verifications;
CREATE TRIGGER expert_verifications_audit
  AFTER INSERT OR UPDATE OR DELETE ON expert_verifications
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS payments_audit ON payments;
CREATE TRIGGER payments_audit
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Rate limiting for admin actions (prevent abuse)
CREATE OR REPLACE FUNCTION check_admin_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  action_count INTEGER;
BEGIN
  -- Check if admin has performed more than 100 actions in the last hour
  SELECT COUNT(*) INTO action_count
  FROM admin_audit_log
  WHERE admin_id = auth.uid()
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF action_count > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before performing more admin actions.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply rate limiting to sensitive operations
DROP TRIGGER IF EXISTS expert_verifications_rate_limit ON expert_verifications;
CREATE TRIGGER expert_verifications_rate_limit
  BEFORE INSERT OR UPDATE OR DELETE ON expert_verifications
  FOR EACH ROW WHEN (is_admin())
  EXECUTE FUNCTION check_admin_rate_limit();

-- Additional security: Prevent SQL injection in admin functions
CREATE OR REPLACE FUNCTION secure_admin_search(
  search_table TEXT,
  search_term TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(result JSONB) AS $$
BEGIN
  -- Only allow predefined table names
  IF search_table NOT IN ('users', 'expert_verifications', 'payments', 'notifications') THEN
    RAISE EXCEPTION 'Invalid table name for search';
  END IF;
  
  -- Ensure user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Limit search results to prevent DoS
  IF limit_count > 100 THEN
    limit_count := 100;
  END IF;
  
  -- Execute safe search based on table
  CASE search_table
    WHEN 'users' THEN
      RETURN QUERY
      SELECT row_to_json(u.*) 
      FROM users u
      WHERE u.email ILIKE '%' || search_term || '%' 
         OR u.name ILIKE '%' || search_term || '%'
      LIMIT limit_count;
    
    WHEN 'expert_verifications' THEN
      RETURN QUERY
      SELECT row_to_json(ev.*)
      FROM expert_verifications ev
      WHERE ev.name ILIKE '%' || search_term || '%'
         OR ev.email ILIKE '%' || search_term || '%'
      LIMIT limit_count;
      
    -- Add other cases as needed
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;