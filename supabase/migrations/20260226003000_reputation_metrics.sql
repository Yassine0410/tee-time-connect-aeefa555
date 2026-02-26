-- Participation status for attendance reliability
ALTER TABLE public.round_players
ADD COLUMN IF NOT EXISTS participation_status TEXT NOT NULL DEFAULT 'joined';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'round_players_participation_status_check'
  ) THEN
    ALTER TABLE public.round_players
      ADD CONSTRAINT round_players_participation_status_check
      CHECK (participation_status IN ('joined', 'present', 'no_show', 'left'));
  END IF;
END $$;

-- Allow updates to participation status by participant or organizer.
CREATE POLICY "Users can update their participation status"
  ON public.round_players FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Organizers can update participant status"
  ON public.round_players FOR UPDATE
  TO authenticated
  USING (
    round_id IN (
      SELECT r.id
      FROM public.golf_rounds r
      JOIN public.profiles p ON p.id = r.organizer_id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    round_id IN (
      SELECT r.id
      FROM public.golf_rounds r
      JOIN public.profiles p ON p.id = r.organizer_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Post-round peer reviews.
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.golf_rounds(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT reviews_not_self CHECK (reviewer_id <> reviewed_user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_round_reviewer_target
  ON public.reviews(round_id, reviewer_id, reviewed_user_id);

CREATE INDEX IF NOT EXISTS reviews_reviewed_user_idx
  ON public.reviews(reviewed_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS reviews_round_idx
  ON public.reviews(round_id);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Participants can create reviews on completed rounds"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.golf_rounds gr
      WHERE gr.id = round_id
        AND gr.status = 'completed'
    )
    AND EXISTS (
      SELECT 1
      FROM public.round_players rp
      WHERE rp.round_id = round_id
        AND rp.profile_id = reviewer_id
    )
    AND EXISTS (
      SELECT 1
      FROM public.round_players rp
      WHERE rp.round_id = round_id
        AND rp.profile_id = reviewed_user_id
    )
  );

CREATE POLICY "Review authors can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (
    reviewer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    reviewer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Review authors can delete their own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (
    reviewer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
