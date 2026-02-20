
-- Golf Courses table
CREATE TABLE public.golf_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  holes INTEGER NOT NULL DEFAULT 18,
  par INTEGER NOT NULL DEFAULT 72,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by authenticated users"
  ON public.golf_courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert courses"
  ON public.golf_courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default courses
INSERT INTO public.golf_courses (name, location, holes, par) VALUES
  ('Pebble Beach Golf Links', 'Pebble Beach, CA', 18, 72),
  ('TPC Scottsdale', 'Scottsdale, AZ', 18, 71),
  ('Bandon Dunes', 'Bandon, OR', 18, 72),
  ('Whistling Straits', 'Kohler, WI', 18, 72),
  ('Bethpage Black', 'Farmingdale, NY', 18, 71),
  ('Kiawah Island Ocean', 'Kiawah Island, SC', 18, 72),
  ('Spanish Bay', 'Pebble Beach, CA', 18, 72),
  ('Chambers Bay', 'University Place, WA', 18, 72);

-- Golf Rounds table
CREATE TABLE public.golf_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Stroke Play',
  players_needed INTEGER NOT NULL DEFAULT 4,
  handicap_range TEXT NOT NULL DEFAULT 'All Levels',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.golf_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rounds are viewable by authenticated users"
  ON public.golf_rounds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create rounds"
  ON public.golf_rounds FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Organizers can update their rounds"
  ON public.golf_rounds FOR UPDATE
  TO authenticated
  USING (organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Organizers can delete their rounds"
  ON public.golf_rounds FOR DELETE
  TO authenticated
  USING (organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Round Players (join table)
CREATE TABLE public.round_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.golf_rounds(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(round_id, profile_id)
);

ALTER TABLE public.round_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Round players viewable by authenticated users"
  ON public.round_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join rounds"
  ON public.round_players FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can leave rounds"
  ON public.round_players FOR DELETE
  TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at on golf_rounds
CREATE TRIGGER update_golf_rounds_updated_at
  BEFORE UPDATE ON public.golf_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-update round status when full
CREATE OR REPLACE FUNCTION public.update_round_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  needed INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO current_count FROM public.round_players WHERE round_id = NEW.round_id;
    SELECT players_needed INTO needed FROM public.golf_rounds WHERE id = NEW.round_id;
    IF current_count >= needed THEN
      UPDATE public.golf_rounds SET status = 'full' WHERE id = NEW.round_id AND status = 'open';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT COUNT(*) INTO current_count FROM public.round_players WHERE round_id = OLD.round_id;
    SELECT players_needed INTO needed FROM public.golf_rounds WHERE id = OLD.round_id;
    IF current_count < needed THEN
      UPDATE public.golf_rounds SET status = 'open' WHERE id = OLD.round_id AND status = 'full';
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER update_round_status_on_join
  AFTER INSERT OR DELETE ON public.round_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_round_status();
