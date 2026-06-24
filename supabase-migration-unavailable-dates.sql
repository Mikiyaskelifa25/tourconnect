-- =============================================
-- Unavailable Dates System
-- Stores dates when guides are not available
-- =============================================

CREATE TABLE IF NOT EXISTS public.guide_unavailable_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guide_id, date)
);

CREATE INDEX IF NOT EXISTS idx_guide_unavailable_guide ON public.guide_unavailable_dates(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_unavailable_date ON public.guide_unavailable_dates(date);

ALTER TABLE public.guide_unavailable_dates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guide_unavailable_dates') THEN
    CREATE POLICY "Allow all" ON public.guide_unavailable_dates FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;


