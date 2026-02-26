-- Fix: allow the current organizer to transfer ownership when leaving a round.
-- Without an explicit WITH CHECK, Postgres applies the USING clause as a check on the new row,
-- which blocks setting organizer_id to another player.

DROP POLICY IF EXISTS "Organizers can update their rounds" ON public.golf_rounds;

CREATE POLICY "Organizers can update their rounds"
  ON public.golf_rounds
  FOR UPDATE
  TO authenticated
  USING (
    organizer_id IN (
      SELECT id
      FROM public.profiles
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Allow normal organizer updates (organizer keeps ownership)...
    organizer_id IN (
      SELECT id
      FROM public.profiles
      WHERE user_id = auth.uid()
    )
    -- ...and allow transferring ownership to an existing participant of the round.
    OR organizer_id IN (
      SELECT profile_id
      FROM public.round_players
      WHERE round_id = id
    )
  );

