-- =============================================
-- Ethio Tour Guid Portal - Update 002
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Expand notifications type CHECK to allow 'sent' and 'message'
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
    WHERE rel.relname = 'notifications'
      AND con.contype = 'c'
      AND att.attname = 'type'
  ) LOOP
    EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT ' || r.conname;
  END LOOP;
END $$;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN ('accepted', 'rejected', 'sent', 'message'));

NOTIFY pgrst, 'reload schema';
