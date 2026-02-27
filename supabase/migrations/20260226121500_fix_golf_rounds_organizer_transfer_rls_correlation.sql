-- Fix follow-up: the previous policy used `round_id = id` inside a subquery, where `id`
-- resolves to `round_players.id` (not the outer `golf_rounds.id`). That makes the check
-- always false and still blocks organizer transfer.

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
    -- Allow organizer to keep ownership...
    organizer_id IN (
      SELECT id
      FROM public.profiles
      WHERE user_id = auth.uid()
    )
    -- ...or transfer ownership to an existing participant of this round.
    OR EXISTS (
      SELECT 1
      FROM public.round_players rp
      WHERE rp.round_id = golf_rounds.id
        AND rp.profile_id = organizer_id
    )
  );

