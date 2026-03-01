
-- Conversations table: supports DM and round group chats
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'dm' CHECK (type IN ('dm', 'round')),
  round_id UUID REFERENCES public.golf_rounds(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, profile_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is participant of a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    JOIN public.profiles p ON p.id = cp.profile_id
    WHERE cp.conversation_id = conv_id AND p.user_id = auth.uid()
  );
$$;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (public.is_conversation_participant(id));

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- Participants policies
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Users can add participants"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    public.is_conversation_participant(conversation_id)
    AND sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conv_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_profile ON public.conversation_participants(profile_id);
CREATE INDEX idx_conversations_round ON public.conversations(round_id);

-- Auto-create round conversation when a round is created
CREATE OR REPLACE FUNCTION public.create_round_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  INSERT INTO public.conversations (type, round_id) VALUES ('round', NEW.id) RETURNING id INTO conv_id;
  INSERT INTO public.conversation_participants (conversation_id, profile_id) VALUES (conv_id, NEW.organizer_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_round_created
  AFTER INSERT ON public.golf_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.create_round_conversation();

-- Auto-add player to round conversation when they join
CREATE OR REPLACE FUNCTION public.add_player_to_round_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  SELECT id INTO conv_id FROM public.conversations WHERE round_id = NEW.round_id AND type = 'round';
  IF conv_id IS NOT NULL THEN
    INSERT INTO public.conversation_participants (conversation_id, profile_id)
    VALUES (conv_id, NEW.profile_id)
    ON CONFLICT (conversation_id, profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_player_joined
  AFTER INSERT ON public.round_players
  FOR EACH ROW
  EXECUTE FUNCTION public.add_player_to_round_conversation();

-- Remove player from round conversation when they leave
CREATE OR REPLACE FUNCTION public.remove_player_from_round_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  SELECT id INTO conv_id FROM public.conversations WHERE round_id = OLD.round_id AND type = 'round';
  IF conv_id IS NOT NULL THEN
    DELETE FROM public.conversation_participants WHERE conversation_id = conv_id AND profile_id = OLD.profile_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_player_left
  AFTER DELETE ON public.round_players
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_player_from_round_conversation();
