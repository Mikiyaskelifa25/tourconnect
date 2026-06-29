-- Job Postings System
-- Operators post jobs, guides browse and apply

CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES public.tour_operators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  daily_rate DECIMAL(10,2),
  languages_required TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, guide_id)
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for job_postings
DROP POLICY IF EXISTS "Anyone can view open job postings" ON public.job_postings;
CREATE POLICY "Anyone can view open job postings" ON public.job_postings
  FOR SELECT USING (status = 'open' OR operator_id = auth.uid());

DROP POLICY IF EXISTS "Operators can insert their own postings" ON public.job_postings;
CREATE POLICY "Operators can insert their own postings" ON public.job_postings
  FOR INSERT WITH CHECK (operator_id = auth.uid());

DROP POLICY IF EXISTS "Operators can update their own postings" ON public.job_postings;
CREATE POLICY "Operators can update their own postings" ON public.job_postings
  FOR UPDATE USING (operator_id = auth.uid());

-- Policies for job_applications
DROP POLICY IF EXISTS "Guides can view their own applications" ON public.job_applications;
CREATE POLICY "Guides can view their own applications" ON public.job_applications
  FOR SELECT USING (guide_id = auth.uid());

DROP POLICY IF EXISTS "Operators can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Operators can view applications for their jobs" ON public.job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.operator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Guides can insert their own applications" ON public.job_applications;
CREATE POLICY "Guides can insert their own applications" ON public.job_applications
  FOR INSERT WITH CHECK (guide_id = auth.uid());

DROP POLICY IF EXISTS "Operators can update applications on their jobs" ON public.job_applications;
CREATE POLICY "Operators can update applications on their jobs" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.operator_id = auth.uid()
    )
  );
