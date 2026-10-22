-- ==============================================================================
-- Notion AI Clone - Supabase Database Schema Migration
-- Free Tier Compatible (Free PostgreSQL, Row-Level Security & Storage)
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content JSONB DEFAULT '[]'::jsonb,
    parent_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    icon TEXT,
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Helpful Performance Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON public.documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_archived ON public.documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_favorite ON public.documents(is_favorite);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Ensure users can strictly access only their own documents
CREATE POLICY "Users can view their own documents"
    ON public.documents
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
    ON public.documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.documents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Trigger to automatically update `updated_at` timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.documents;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. (Optional) Storage bucket for document covers/attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-assets', 'document-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated user asset uploads"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'document-assets' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public asset reads"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'document-assets');
