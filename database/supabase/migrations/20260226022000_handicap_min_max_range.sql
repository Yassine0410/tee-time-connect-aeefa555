-- Add numeric handicap range for rounds (0..36) while keeping legacy handicap_range text.
ALTER TABLE public.golf_rounds
ADD COLUMN IF NOT EXISTS min_handicap INTEGER,
ADD COLUMN IF NOT EXISTS max_handicap INTEGER;

-- Backfill new columns from legacy category/text values.
UPDATE public.golf_rounds
SET
  min_handicap = CASE
    WHEN handicap_range = '0-10' THEN 0
    WHEN handicap_range = '10-20' THEN 10
    WHEN handicap_range = '20-30' THEN 20
    WHEN handicap_range = '30+' THEN 30
    WHEN handicap_range ~ '^\d{1,2}\s*-\s*\d{1,2}$' THEN split_part(regexp_replace(handicap_range, '\s+', '', 'g'), '-', 1)::INTEGER
    WHEN handicap_range ~ '^\d{1,2}\+$' THEN regexp_replace(handicap_range, '\+', '', 'g')::INTEGER
    ELSE 0
  END,
  max_handicap = CASE
    WHEN handicap_range = '0-10' THEN 10
    WHEN handicap_range = '10-20' THEN 20
    WHEN handicap_range = '20-30' THEN 30
    WHEN handicap_range = '30+' THEN 36
    WHEN handicap_range ~ '^\d{1,2}\s*-\s*\d{1,2}$' THEN split_part(regexp_replace(handicap_range, '\s+', '', 'g'), '-', 2)::INTEGER
    WHEN handicap_range ~ '^\d{1,2}\+$' THEN 36
    ELSE 36
  END
WHERE min_handicap IS NULL OR max_handicap IS NULL;

-- Clamp values to official bounds and enforce defaults.
UPDATE public.golf_rounds
SET
  min_handicap = GREATEST(0, LEAST(COALESCE(min_handicap, 0), 36)),
  max_handicap = GREATEST(0, LEAST(COALESCE(max_handicap, 36), 36));

UPDATE public.golf_rounds
SET
  min_handicap = LEAST(min_handicap, max_handicap),
  max_handicap = GREATEST(min_handicap, max_handicap);

ALTER TABLE public.golf_rounds
  ALTER COLUMN min_handicap SET DEFAULT 0,
  ALTER COLUMN max_handicap SET DEFAULT 36;

UPDATE public.golf_rounds
SET
  min_handicap = COALESCE(min_handicap, 0),
  max_handicap = COALESCE(max_handicap, 36)
WHERE min_handicap IS NULL OR max_handicap IS NULL;

ALTER TABLE public.golf_rounds
  ALTER COLUMN min_handicap SET NOT NULL,
  ALTER COLUMN max_handicap SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'golf_rounds_handicap_bounds_check'
  ) THEN
    ALTER TABLE public.golf_rounds
      ADD CONSTRAINT golf_rounds_handicap_bounds_check
      CHECK (
        min_handicap BETWEEN 0 AND 36
        AND max_handicap BETWEEN 0 AND 36
        AND min_handicap <= max_handicap
      );
  END IF;
END $$;
