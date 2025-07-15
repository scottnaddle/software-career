-- Create storage bucket for career documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('career-documents', 'career-documents', true);

-- Create file_attachments table for metadata
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    career_type TEXT CHECK (career_type IN ('work', 'education', 'project', 'certificate')),
    career_id UUID,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_attachments_user_id ON file_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_career_type ON file_attachments(career_type);
CREATE INDEX IF NOT EXISTS idx_file_attachments_career_id ON file_attachments(career_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_upload_date ON file_attachments(upload_date DESC);

-- Enable RLS on file_attachments table
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for file_attachments table
CREATE POLICY "Users can view their own files" ON file_attachments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON file_attachments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON file_attachments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON file_attachments
    FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for career-documents bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'career-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'career-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'career-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'career-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public access to files (since they're behind authentication anyway)
CREATE POLICY "Public read access to career documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'career-documents');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_file_attachments_updated_at
    BEFORE UPDATE ON file_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add file attachment fields to careers table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'careers' AND column_name = 'attachments') THEN
        ALTER TABLE careers ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create function to get file usage statistics
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS TABLE (
    total_files BIGINT,
    total_size BIGINT,
    usage_by_type JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_files,
        COALESCE(SUM(file_size), 0)::BIGINT as total_size,
        COALESCE(
            jsonb_object_agg(
                COALESCE(career_type, 'general'), 
                jsonb_build_object(
                    'count', type_stats.file_count,
                    'size', type_stats.total_size
                )
            ), 
            '{}'::jsonb
        ) as usage_by_type
    FROM file_attachments f
    LEFT JOIN (
        SELECT 
            career_type,
            COUNT(*) as file_count,
            SUM(file_size) as total_size
        FROM file_attachments
        WHERE user_id = user_uuid
        GROUP BY career_type
    ) type_stats ON f.career_type = type_stats.career_type
    WHERE f.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete file records where the storage file no longer exists
    -- This would need to be implemented with a more complex check
    -- For now, just return 0
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;