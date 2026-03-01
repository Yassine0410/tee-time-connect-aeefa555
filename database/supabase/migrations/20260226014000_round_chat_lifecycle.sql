-- Round chat lifecycle:
-- - create round conversation only on first message
-- - archive round conversation after end_time + 24h (if completed and has messages)
-- - support per-user soft delete of conversations

-- 1) Add optional round end time for archive cutoff logic.
ALTER TABLE public.golf_rounds
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- 2) Add archived timestamp on conversations.
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- 3) Remove automatic empty round chat creation.
DROP TRIGGER IF EXISTS on_round_created ON public.golf_rounds;
DROP FUNCTION IF EXISTS public.create_round_conversation();

-- 4) Ensure one round conversation per round.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'conversations_round_id_unique'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_round_id_unique UNIQUE (round_id);
  END IF;
END $$;

-- 5) Cleanup old empty round chats (created previously by trigger).
DELETE FROM public.conversations c
WHERE c.type = 'round'
  AND NOT EXISTS (
    SELECT 1 FROM public.messages m WHERE m.conversation_id = c.id
  );

-- 6) Per-user conversation state (soft-delete/hide).
CREATE TABLE IF NOT EXISTS public.conversation_user_states (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hidden_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (conversation_id, profile_id)
);

ALTER TABLE public.conversation_user_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversation states"
  ON public.conversation_user_states FOR SELECT
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their conversation states"
  ON public.conversation_user_states FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their conversation states"
  ON public.conversation_user_states FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 7) Create/get round conversation lazily when first message is sent.
CREATE OR REPLACE FUNCTION public.get_or_create_round_conversation(target_round_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  SELECT id
    INTO conv_id
  FROM public.conversations
  WHERE type = 'round' AND round_id = target_round_id
  LIMIT 1;

  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (type, round_id)
    VALUES ('round', target_round_id)
    ON CONFLICT (round_id) DO UPDATE SET round_id = EXCLUDED.round_id
    RETURNING id INTO conv_id;
  END IF;

  -- Add all current round participants.
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  SELECT conv_id, rp.profile_id
  FROM public.round_players rp
  WHERE rp.round_id = target_round_id
  ON CONFLICT (conversation_id, profile_id) DO NOTHING;

  -- Ensure organizer is also part of the conversation.
  INSERT INTO public.conversation_participants (conversation_id, profile_id)
  SELECT conv_id, gr.organizer_id
  FROM public.golf_rounds gr
  WHERE gr.id = target_round_id
  ON CONFLICT (conversation_id, profile_id) DO NOTHING;

  RETURN conv_id;
END;
$$;

-- 8) Auto-archive expired round conversations.
CREATE OR REPLACE FUNCTION public.archive_expired_round_conversations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations c
  SET archived_at = now()
  FROM public.golf_rounds gr
  WHERE c.type = 'round'
    AND c.round_id = gr.id
    AND c.archived_at IS NULL
    AND gr.status = 'completed'
    AND gr.end_time IS NOT NULL
    AND now() >= (gr.end_time + interval '24 hour')
    AND EXISTS (
      SELECT 1
      FROM public.messages m
      WHERE m.conversation_id = c.id
    );
END;
$$;

-- 9) Harden message sending policy: archived/expired chats are read-only.
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to writable conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_conversation_participant(conversation_id)
    AND sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.archived_at IS NULL
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.golf_rounds gr ON gr.id = c.round_id
      WHERE c.id = conversation_id
        AND c.type = 'round'
        AND gr.status = 'completed'
        AND gr.end_time IS NOT NULL
        AND now() >= (gr.end_time + interval '24 hour')
    )
  );
