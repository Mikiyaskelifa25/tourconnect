-- =============================================
-- Ethio Tour Guid Portal - Update 003
-- Add ratings table for operator guide reviews
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.tour_operators(id) ON DELETE CASCADE,
  hire_request_id UUID REFERENCES public.hire_requests(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guide_id, operator_id, hire_request_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_ratings_guide ON public.ratings(guide_id);
CREATE INDEX IF NOT EXISTS idx_ratings_operator ON public.ratings(operator_id);

-- 3. RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.ratings;
CREATE POLICY "Allow all" ON public.ratings FOR ALL USING (true) WITH CHECK (true);

-- 4. Refresh schema cache
NOTIFY pgrst, 'reload schema';
