-- Payment System Integration Migration
-- This migration completes the payment system integration with career verification

-- Update payments table to ensure all necessary columns exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'toss',
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_data JSONB,
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_key TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'canceled'));

-- Create unique index on order_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Create index on payment_key
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON payments(payment_key);

-- Create index on transaction_id
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Add payment_id column to review_requests table
ALTER TABLE review_requests 
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;

-- Create index on payment_id
CREATE INDEX IF NOT EXISTS idx_review_requests_payment_id ON review_requests(payment_id);

-- Update existing review_requests to link with payments
UPDATE review_requests 
SET payment_id = p.id
FROM payments p
WHERE review_requests.user_id = p.user_id 
  AND review_requests.created_at >= p.created_at 
  AND review_requests.payment_id IS NULL
  AND p.type = 'verification';

-- Create function to handle payment completion
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If payment is completed and it's for verification
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.type = 'verification' THEN
        -- Find the most recent career for this user
        INSERT INTO review_requests (
            career_id,
            user_id,
            payment_id,
            priority,
            review_fee,
            status,
            requested_at
        )
        SELECT 
            c.id,
            NEW.user_id,
            NEW.id,
            CASE WHEN NEW.service_type = 'express' THEN 'high' ELSE 'normal' END,
            CASE WHEN NEW.service_type = 'express' THEN 100000 ELSE 50000 END,
            'assigned',
            NOW()
        FROM careers c
        WHERE c.user_id = NEW.user_id
        ORDER BY c.created_at DESC
        LIMIT 1;
        
        -- Update career status to pending
        UPDATE careers 
        SET status = 'pending' 
        WHERE user_id = NEW.user_id 
          AND id = (
            SELECT id FROM careers 
            WHERE user_id = NEW.user_id 
            ORDER BY created_at DESC 
            LIMIT 1
          );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment completion
DROP TRIGGER IF EXISTS payment_completion_trigger ON payments;
CREATE TRIGGER payment_completion_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION handle_payment_completion();

-- Create function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_statistics(start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
    total_payments INTEGER,
    total_amount NUMERIC,
    completed_payments INTEGER,
    completed_amount NUMERIC,
    pending_payments INTEGER,
    pending_amount NUMERIC,
    failed_payments INTEGER,
    failed_amount NUMERIC,
    average_payment_amount NUMERIC,
    payment_methods JSONB
) AS $$
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE;
    END IF;
    
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_payments,
        COALESCE(SUM(p.amount), 0) as total_amount,
        COUNT(CASE WHEN p.status = 'completed' THEN 1 END)::INTEGER as completed_payments,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as completed_amount,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END)::INTEGER as pending_payments,
        COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END), 0) as pending_amount,
        COUNT(CASE WHEN p.status = 'failed' THEN 1 END)::INTEGER as failed_payments,
        COALESCE(SUM(CASE WHEN p.status = 'failed' THEN p.amount ELSE 0 END), 0) as failed_amount,
        COALESCE(AVG(p.amount), 0) as average_payment_amount,
        jsonb_object_agg(
            p.payment_method,
            COUNT(CASE WHEN p.payment_method IS NOT NULL THEN 1 END)
        ) FILTER (WHERE p.payment_method IS NOT NULL) as payment_methods
    FROM payments p
    WHERE p.created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user payment history
CREATE OR REPLACE FUNCTION get_user_payment_history(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    payment_id UUID,
    order_id TEXT,
    type TEXT,
    service_type TEXT,
    amount INTEGER,
    status TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    career_title TEXT,
    review_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as payment_id,
        p.order_id,
        p.type,
        p.service_type,
        p.amount,
        p.status,
        p.payment_method,
        p.created_at,
        p.completed_at,
        c.title as career_title,
        rr.status as review_status
    FROM payments p
    LEFT JOIN review_requests rr ON p.id = rr.payment_id
    LEFT JOIN careers c ON rr.career_id = c.id
    WHERE p.user_id = user_uuid
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert their own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments (for payment processing)
CREATE POLICY "Users can update their own payments"
ON payments FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND account_type = 'admin'
    )
);

-- Admins can update all payments
CREATE POLICY "Admins can update all payments"
ON payments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND account_type = 'admin'
    )
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_payment_statistics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_payment_history(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_payment_completion() TO authenticated;

-- Create view for payment dashboard
CREATE OR REPLACE VIEW payment_dashboard AS
SELECT 
    p.id,
    p.user_id,
    p.order_id,
    p.type,
    p.service_type,
    p.amount,
    p.status,
    p.payment_method,
    p.created_at,
    p.completed_at,
    u.name as user_name,
    u.email as user_email,
    c.title as career_title,
    rr.status as review_status,
    rr.review_result
FROM payments p
JOIN users u ON p.user_id = u.id
LEFT JOIN review_requests rr ON p.id = rr.payment_id
LEFT JOIN careers c ON rr.career_id = c.id;

-- Grant access to payment dashboard for admins
GRANT SELECT ON payment_dashboard TO authenticated;

-- Create RLS policy for payment dashboard
CREATE POLICY "Payment dashboard access"
ON payment_dashboard FOR SELECT
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND account_type = 'admin'
    )
);

-- Create notification for payment completion
CREATE OR REPLACE FUNCTION notify_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Create notification for user
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            NEW.user_id,
            'payment_completed',
            '결제가 완료되었습니다',
            format('%s원 결제가 성공적으로 완료되었습니다.', NEW.amount),
            jsonb_build_object(
                'payment_id', NEW.id,
                'order_id', NEW.order_id,
                'amount', NEW.amount,
                'service_type', NEW.service_type
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment notification
DROP TRIGGER IF EXISTS payment_notification_trigger ON payments;
CREATE TRIGGER payment_notification_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_completion();

-- Add comment to document the migration
COMMENT ON FUNCTION handle_payment_completion IS 'Automatically creates review requests when payments are completed';
COMMENT ON FUNCTION get_payment_statistics IS 'Returns payment statistics for a given date range';
COMMENT ON FUNCTION get_user_payment_history IS 'Returns payment history for a specific user';
COMMENT ON VIEW payment_dashboard IS 'Comprehensive view of payment data with user and career information';