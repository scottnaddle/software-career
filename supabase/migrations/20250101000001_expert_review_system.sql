-- Expert Review System Database Schema

-- 전문가 테이블
CREATE TABLE IF NOT EXISTS experts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expert_type TEXT NOT NULL CHECK (expert_type IN ('individual', 'organization')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    specializations TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    education TEXT,
    certifications TEXT[],
    company TEXT,
    position TEXT,
    bio TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id)
);

-- 검토 요청 테이블
CREATE TABLE IF NOT EXISTS review_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled'
    )),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    review_fee DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검토 결과 테이블
CREATE TABLE IF NOT EXISTS review_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_request_id UUID NOT NULL REFERENCES review_requests(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected', 'needs_clarification')),
    confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 100),
    feedback TEXT NOT NULL,
    verification_points JSONB DEFAULT '[]',
    issues_found JSONB DEFAULT '[]',
    recommendations TEXT,
    supporting_documents TEXT[],
    time_spent_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 전문가 특기 분야 테이블
CREATE TABLE IF NOT EXISTS specialization_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES specialization_categories(id),
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_status ON experts(status);
CREATE INDEX IF NOT EXISTS idx_experts_specializations ON experts USING GIN(specializations);

CREATE INDEX IF NOT EXISTS idx_review_requests_career_id ON review_requests(career_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_requester_id ON review_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_expert_id ON review_requests(expert_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
CREATE INDEX IF NOT EXISTS idx_review_requests_created_at ON review_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_results_review_request_id ON review_results(review_request_id);
CREATE INDEX IF NOT EXISTS idx_review_results_expert_id ON review_results(expert_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- RLS 정책 활성화
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 전문가 테이블 RLS 정책
CREATE POLICY "Experts can view their own profile" ON experts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Experts can update their own profile" ON experts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved experts" ON experts
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can apply to become experts" ON experts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 검토 요청 테이블 RLS 정책
CREATE POLICY "Users can view their own review requests" ON review_requests
    FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Experts can view assigned requests" ON review_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE experts.id = review_requests.expert_id 
            AND experts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create review requests" ON review_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Experts can update assigned requests" ON review_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE experts.id = review_requests.expert_id 
            AND experts.user_id = auth.uid()
        )
    );

-- 검토 결과 테이블 RLS 정책
CREATE POLICY "Users can view results for their requests" ON review_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM review_requests 
            WHERE review_requests.id = review_results.review_request_id 
            AND review_requests.requester_id = auth.uid()
        )
    );

CREATE POLICY "Experts can view and manage their results" ON review_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE experts.id = review_results.expert_id 
            AND experts.user_id = auth.uid()
        )
    );

-- 알림 테이블 RLS 정책
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 기본 특기 분야 데이터 삽입
INSERT INTO specialization_categories (name, description, icon) VALUES
('Technology', 'IT, Software Development, Data Science', 'code'),
('Business', 'Management, Strategy, Marketing', 'briefcase'),
('Finance', 'Accounting, Banking, Investment', 'dollar-sign'),
('Healthcare', 'Medical, Pharmaceutical, Biotechnology', 'heart'),
('Education', 'Teaching, Training, Academic Research', 'book'),
('Engineering', 'Civil, Mechanical, Electrical Engineering', 'settings'),
('Design', 'UI/UX, Graphic Design, Architecture', 'palette'),
('Legal', 'Law, Compliance, Intellectual Property', 'scale'),
('Marketing', 'Digital Marketing, Branding, PR', 'megaphone'),
('Operations', 'Supply Chain, Logistics, Manufacturing', 'truck')
ON CONFLICT (name) DO NOTHING;

-- 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_experts_updated_at
    BEFORE UPDATE ON experts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
    BEFORE UPDATE ON review_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_results_updated_at
    BEFORE UPDATE ON review_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 전문가 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_expert_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE experts 
    SET 
        rating = (
            SELECT AVG(confidence_score::decimal / 20)  -- 100점 만점을 5점 만점으로 변환
            FROM review_results 
            WHERE expert_id = NEW.expert_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM review_results 
            WHERE expert_id = NEW.expert_id
        )
    WHERE id = NEW.expert_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 평점 업데이트 트리거
CREATE TRIGGER update_expert_rating_trigger
    AFTER INSERT OR UPDATE ON review_results
    FOR EACH ROW EXECUTE FUNCTION update_expert_rating();

-- 알림 생성 함수
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;