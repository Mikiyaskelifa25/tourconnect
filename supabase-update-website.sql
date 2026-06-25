-- Add website column and seed sample data
ALTER TABLE tour_guides ADD COLUMN IF NOT EXISTS website TEXT;

-- Seed sample website URLs for existing guides
UPDATE tour_guides SET website = 'https://abebetours.com'    WHERE email = 'abebe@guide.com'    AND website IS NULL;
UPDATE tour_guides SET website = 'https://selamtours.com'    WHERE email = 'selam@guide.com'    AND website IS NULL;
UPDATE tour_guides SET website = 'https://girmaguide.com'    WHERE email = 'girma@guide.com'    AND website IS NULL;
