-- ==============================================================================
-- Notion AI Clone - Universal Cloud Database Migration
-- Free Tier Compatible (PostgreSQL + Real-time Cloud Sync across all devices)
-- ==============================================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Documents Table with attachments support
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'admin-user',
    title TEXT NOT NULL DEFAULT 'Untitled',
    content JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    parent_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    icon TEXT DEFAULT '📄',
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON public.documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_archived ON public.documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_favorite ON public.documents(is_favorite);

-- 4. Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 5. Universal Access Policy (allows seamless sync across your phone, laptop, and desktop)
DROP POLICY IF EXISTS "Universal access policy" ON public.documents;
CREATE POLICY "Universal access policy"
    ON public.documents
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Trigger to update updated_at automatically
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
