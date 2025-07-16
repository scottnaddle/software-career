-- Enhanced User Profile System Migration
-- This migration adds enhanced user profile functionality and expert verification system

-- Add new columns to users table for enhanced profile information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_expert BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expert_specialties TEXT[],
ADD COLUMN IF NOT EXISTS expert_rate INTEGER,
ADD COLUMN IF NOT EXISTS expert_bio TEXT,
ADD COLUMN IF NOT EXISTS expert_verification_status TEXT CHECK (expert_verification_status IN ('pending', 'verified', 'rejected'));

-- Create expert_verifications table
CREATE TABLE IF NOT EXISTS expert_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialties TEXT[] NOT NULL,
    rate INTEGER NOT NULL,
    bio TEXT NOT NULL,
    portfolio_url TEXT,
    linkedin_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add enhanced columns to review_requests table
ALTER TABLE review_requests 
ADD COLUMN IF NOT EXISTS review_strengths TEXT[],
ADD COLUMN IF NOT EXISTS review_weaknesses TEXT[],
ADD COLUMN IF NOT EXISTS review_recommendations TEXT[];

-- Add columns to careers table for enhanced verification
ALTER TABLE careers 
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_is_expert ON users(is_expert);
CREATE INDEX IF NOT EXISTS idx_users_expert_verification_status ON users(expert_verification_status);
CREATE INDEX IF NOT EXISTS idx_expert_verifications_user_id ON expert_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_verifications_status ON expert_verifications(status);
CREATE INDEX IF NOT EXISTS idx_careers_verification_date ON careers(verification_date);

-- Create RLS policies for expert_verifications
ALTER TABLE expert_verifications ENABLE ROW LEVEL SECURITY;

-- Users can see their own verification requests
CREATE POLICY "Users can view their own expert verifications"
ON expert_verifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own verification requests
CREATE POLICY "Users can insert their own expert verifications"
ON expert_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all expert verifications"
ON expert_verifications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND account_type = 'admin'
    )
);

-- Admins can update verification requests
CREATE POLICY "Admins can update expert verifications"
ON expert_verifications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND account_type = 'admin'
    )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expert_verifications_updated_at
    BEFORE UPDATE ON expert_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user profile statistics
CREATE OR REPLACE FUNCTION get_user_profile_stats(user_uuid UUID)
RETURNS TABLE (
    total_careers INTEGER,
    verified_careers INTEGER,
    pending_careers INTEGER,
    rejected_careers INTEGER,
    total_reviews INTEGER,
    completed_reviews INTEGER,
    pending_reviews INTEGER,
    average_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM careers WHERE user_id = user_uuid) as total_careers,
        (SELECT COUNT(*)::INTEGER FROM careers WHERE user_id = user_uuid AND status = 'verified') as verified_careers,
        (SELECT COUNT(*)::INTEGER FROM careers WHERE user_id = user_uuid AND status = 'pending') as pending_careers,
        (SELECT COUNT(*)::INTEGER FROM careers WHERE user_id = user_uuid AND status = 'rejected') as rejected_careers,
        (SELECT COUNT(*)::INTEGER FROM review_requests WHERE expert_id = user_uuid) as total_reviews,
        (SELECT COUNT(*)::INTEGER FROM review_requests WHERE expert_id = user_uuid AND status = 'completed') as completed_reviews,
        (SELECT COUNT(*)::INTEGER FROM review_requests WHERE expert_id = user_uuid AND status IN ('assigned', 'in_progress')) as pending_reviews,
        (SELECT AVG(review_score)::NUMERIC FROM review_requests WHERE expert_id = user_uuid AND status = 'completed' AND review_score IS NOT NULL) as average_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_fields INTEGER := 11;
    filled_fields INTEGER := 0;
    user_record RECORD;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = user_uuid;
    
    IF user_record.name IS NOT NULL AND user_record.name != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.phone IS NOT NULL AND user_record.phone != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.company IS NOT NULL AND user_record.company != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.position IS NOT NULL AND user_record.position != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.bio IS NOT NULL AND user_record.bio != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.skills IS NOT NULL AND array_length(user_record.skills, 1) > 0 THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.education IS NOT NULL AND user_record.education != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.experience_years IS NOT NULL AND user_record.experience_years > 0 THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.industry IS NOT NULL AND user_record.industry != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.location IS NOT NULL AND user_record.location != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    IF user_record.avatar_url IS NOT NULL AND user_record.avatar_url != '' THEN
        filled_fields := filled_fields + 1;
    END IF;
    
    RETURN ROUND((filled_fields::DECIMAL / total_fields::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_profile_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;

-- Create view for expert profiles
CREATE OR REPLACE VIEW expert_profiles AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.company,
    u.position,
    u.bio,
    u.skills,
    u.experience_years,
    u.industry,
    u.location,
    u.avatar_url,
    u.expert_specialties,
    u.expert_rate,
    u.expert_bio,
    u.expert_verification_status,
    u.linkedin_url,
    u.github_url,
    u.portfolio_url,
    u.created_at,
    u.updated_at,
    COALESCE(stats.total_reviews, 0) as total_reviews,
    COALESCE(stats.completed_reviews, 0) as completed_reviews,
    COALESCE(stats.average_rating, 0) as average_rating
FROM users u
LEFT JOIN (
    SELECT 
        expert_id,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reviews,
        AVG(CASE WHEN status = 'completed' THEN review_score END) as average_rating
    FROM review_requests
    GROUP BY expert_id
) stats ON u.id = stats.expert_id
WHERE u.is_expert = true AND u.expert_verification_status = 'verified';

-- Grant access to the expert_profiles view
GRANT SELECT ON expert_profiles TO authenticated;

-- Create RLS policy for expert_profiles view
CREATE POLICY "Expert profiles are publicly readable"
ON expert_profiles FOR SELECT
USING (true);

-- Add comment to document the migration
COMMENT ON TABLE expert_verifications IS 'Stores expert verification requests and their approval status';
COMMENT ON FUNCTION get_user_profile_stats IS 'Returns comprehensive statistics for a user profile';
COMMENT ON FUNCTION calculate_profile_completion IS 'Calculates the completion percentage of a user profile';
COMMENT ON VIEW expert_profiles IS 'Public view of verified expert profiles with statistics';