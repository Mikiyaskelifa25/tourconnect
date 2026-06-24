-- =============================================
-- Ethio Tour Guid Portal - Update 001
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Add availability_status column to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'free'
CHECK (availability_status IN ('free', 'close'));

-- 2. Drop the OLD constraint on availability.status (may have been auto-named)
--    We drop ANY check constraint on this table to start fresh
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_attribute att ON att.attrelid = con.conrelid
      AND att.attnum = ANY(con.conkey)
    WHERE rel.relname = 'availability'
      AND con.contype = 'c'
      AND att.attname = 'status'
  ) LOOP
    EXECUTE 'ALTER TABLE public.availability DROP CONSTRAINT ' || r.conname;
  END LOOP;
END $$;

-- 3. Migrate old status values to 'close'
UPDATE public.availability SET status = 'close' WHERE status IN ('busy', 'tentative');
UPDATE public.users SET availability_status = 'close' WHERE availability_status IN ('busy', 'tentative');

-- 4. Add the new CHECK constraint (all existing rows now comply)
ALTER TABLE public.availability ADD CONSTRAINT availability_status_check
CHECK (status IN ('free', 'close'));

-- 5. Add notifications table (if not already present)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hire_request_id UUID NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('accepted', 'rejected')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5a. Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- 6. RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow all') THEN
    CREATE POLICY "Allow all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 7. Update existing seed guides with initial statuses (fallback if null)
UPDATE public.users SET availability_status = 'free' WHERE email = 'abebe@guide.com' AND availability_status IS NULL;
UPDATE public.users SET availability_status = 'free' WHERE email = 'selam@guide.com' AND availability_status IS NULL;
UPDATE public.users SET availability_status = 'close' WHERE email = 'girma@guide.com' AND availability_status IS NULL;
