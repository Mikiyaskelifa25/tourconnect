-- =============================================
-- Ethio Tour Guid Portal - FK Fixes
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Drop denormalized column from tour_guides (status now comes from availability table)
ALTER TABLE public.tour_guides DROP COLUMN IF EXISTS availability_status;

-- 3. Drop OLD foreign key constraints that still reference `users` (from v1 schema)
--    so we can re-add them referencing the correct tables.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT con.conname, con.conrelid::regclass::text AS tbl
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE con.confrelid = 'public.users'::regclass
      AND con.contype = 'f'
      AND rel.relname IN ('availability', 'guide_languages', 'guide_locations', 'hire_requests', 'notifications')
  ) LOOP
    EXECUTE 'ALTER TABLE public.' || r.tbl || ' DROP CONSTRAINT ' || r.conname;
  END LOOP;
END $$;

-- 4. Add foreign key constraints referencing tour_guides / tour_operators
--    Drop first if re-running, to keep this script idempotent.
ALTER TABLE public.guide_languages
  DROP CONSTRAINT IF EXISTS fk_guide_languages_guide;
ALTER TABLE public.guide_languages
  ADD CONSTRAINT fk_guide_languages_guide
  FOREIGN KEY (guide_id) REFERENCES public.tour_guides(id) ON DELETE CASCADE;

ALTER TABLE public.guide_locations
  DROP CONSTRAINT IF EXISTS fk_guide_locations_guide;
ALTER TABLE public.guide_locations
  ADD CONSTRAINT fk_guide_locations_guide
  FOREIGN KEY (guide_id) REFERENCES public.tour_guides(id) ON DELETE CASCADE;

ALTER TABLE public.availability
  DROP CONSTRAINT IF EXISTS fk_availability_guide;
ALTER TABLE public.availability
  ADD CONSTRAINT fk_availability_guide
  FOREIGN KEY (guide_id) REFERENCES public.tour_guides(id) ON DELETE CASCADE;

ALTER TABLE public.hire_requests
  DROP CONSTRAINT IF EXISTS fk_hire_requests_guide;
ALTER TABLE public.hire_requests
  ADD CONSTRAINT fk_hire_requests_guide
  FOREIGN KEY (guide_id) REFERENCES public.tour_guides(id) ON DELETE CASCADE;

ALTER TABLE public.hire_requests
  DROP CONSTRAINT IF EXISTS fk_hire_requests_operator;
ALTER TABLE public.hire_requests
  ADD CONSTRAINT fk_hire_requests_operator
  FOREIGN KEY (operator_id) REFERENCES public.tour_operators(id) ON DELETE CASCADE;

-- 5. Drop OLD check constraint on availability.status (which only allows 'free','busy','tentative')
--    so we can update existing rows to 'close' without conflict.
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

-- 6. Fix outdated availability status values (safe now that old constraints are gone)
UPDATE public.availability SET status = 'close' WHERE status IN ('busy', 'tentative');

-- 7. Re-add the CHECK constraint allowing only ('free', 'close')
ALTER TABLE public.availability ADD CONSTRAINT availability_status_check CHECK (status IN ('free', 'close'));

-- 8. Create storage bucket for avatars (if not already present)
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- 9. Ensure RLS policy allows public access to the avatars bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

-- 10. Refresh schema cache again after changes
NOTIFY pgrst, 'reload schema';
