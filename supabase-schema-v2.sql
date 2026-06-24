-- =============================================
-- Ethio Tour Guid Portal - Schema v2
-- Separate tables for Tour Guides & Tour Operators
-- Run this in the Supabase SQL Editor
-- Drops old schema and creates fresh tables
-- =============================================

-- 0. Drop old tables (order matters due to FKs)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.hire_requests CASCADE;
DROP TABLE IF EXISTS public.availability CASCADE;
DROP TABLE IF EXISTS public.guide_locations CASCADE;
DROP TABLE IF EXISTS public.guide_languages CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tour Guides table
CREATE TABLE public.tour_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 5.0,
  license_number TEXT,
  availability_status TEXT DEFAULT 'free' CHECK (availability_status IN ('free', 'close')),
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tour Operators table
CREATE TABLE public.tour_operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Guide languages
CREATE TABLE public.guide_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('native', 'fluent', 'intermediate', 'conversational'))
);

-- 5. Guide locations
CREATE TABLE public.guide_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL
);

-- 6. Availability calendar
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('free', 'close')),
  notes TEXT DEFAULT '',
  UNIQUE(guide_id, date)
);

-- 7. Hire requests
CREATE TABLE public.hire_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES public.tour_operators(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.tour_guides(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  message TEXT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hire_request_id UUID NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('accepted', 'rejected')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Indexes for performance
CREATE INDEX idx_guide_languages_guide ON public.guide_languages(guide_id);
CREATE INDEX idx_guide_locations_guide ON public.guide_locations(guide_id);
CREATE INDEX idx_availability_guide_date ON public.availability(guide_id, date);
CREATE INDEX idx_hire_requests_guide ON public.hire_requests(guide_id);
CREATE INDEX idx_hire_requests_operator ON public.hire_requests(operator_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);

-- 10. Row Level Security (allow public read/write for demo)
ALTER TABLE public.tour_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON public.tour_guides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.tour_operators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.guide_languages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.guide_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.availability FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.hire_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 11. Seed data -- Demo tour guides
INSERT INTO public.tour_guides (id, name, email, phone, rating_avg, license_number, availability_status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Abebe Bikila', 'abebe@guide.com', '+251911223344', 4.9, 'ET-G-1029', 'free'),
  ('00000000-0000-0000-0000-000000000002', 'Selamawit Alene', 'selam@guide.com', '+251912556677', 4.8, 'ET-G-8491', 'free'),
  ('00000000-0000-0000-0000-000000000003', 'Girma Kebede', 'girma@guide.com', '+251913998811', 4.2, 'ET-G-4041', 'close');

-- Demo tour operator
INSERT INTO public.tour_operators (id, name, email, phone) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Abyssinia Travels Agency', 'operator@abyssinia.com', '+251115555555');

-- Guide languages
INSERT INTO public.guide_languages (guide_id, language_code, proficiency) VALUES
  ('00000000-0000-0000-0000-000000000001', 'am', 'native'),
  ('00000000-0000-0000-0000-000000000001', 'en', 'fluent'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'intermediate'),
  ('00000000-0000-0000-0000-000000000002', 'am', 'native'),
  ('00000000-0000-0000-0000-000000000002', 'en', 'fluent'),
  ('00000000-0000-0000-0000-000000000002', 'de', 'conversational'),
  ('00000000-0000-0000-0000-000000000003', 'am', 'native'),
  ('00000000-0000-0000-0000-000000000003', 'en', 'fluent');

-- Guide locations
INSERT INTO public.guide_locations (guide_id, location_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lalibela'),
  ('00000000-0000-0000-0000-000000000001', 'Gondar'),
  ('00000000-0000-0000-0000-000000000002', 'Addis Ababa'),
  ('00000000-0000-0000-0000-000000000002', 'Danakil Depression'),
  ('00000000-0000-0000-0000-000000000002', 'Simien Mountains'),
  ('00000000-0000-0000-0000-000000000003', 'Omo Valley'),
  ('00000000-0000-0000-0000-000000000003', 'Lalibela');

-- Availability
INSERT INTO public.availability (guide_id, date, status, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE, 'free', 'Open for Lalibela historical site bookings'),
  ('00000000-0000-0000-0000-000000000002', CURRENT_DATE, 'free', 'Ready for Danakil Depression tours'),
  ('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 'close', 'Booked out for Omo valley trek');

-- Sample hire request
INSERT INTO public.hire_requests (operator_id, guide_id, start_date, end_date, message, daily_rate, status) VALUES
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   CURRENT_DATE + 5, CURRENT_DATE + 8,
   'Need highly competent historical guide for 3 day tour of Lalibela rock-hewn churches',
   60, 'pending');
