import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function isMissingParticipationStatusColumnError(error: any) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('participation_status') && message.includes('round_players');
}

async function insertRoundPlayerWithCompatibility(roundId: string, profileId: string) {
  const withStatus = await supabase
    .from('round_players')
    .insert({
      round_id: roundId,
      profile_id: profileId,
      participation_status: 'joined',
    });

  if (!withStatus.error) return;

  // Backward-compatible fallback for environments where the migration is not applied yet.
  if (!isMissingParticipationStatusColumnError(withStatus.error)) {
    throw withStatus.error;
  }

  const fallback = await supabase
    .from('round_players')
    .insert({
      round_id: roundId,
      profile_id: profileId,
    });

  if (fallback.error) throw fallback.error;
}

// Types derived from DB
export interface ProfileRow {
  id: string;
  user_id: string;
  name: string;
  handicap: number;
  home_club: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  name: string;
  location: string;
  holes: number;
  par: number;
}

export interface RoundWithDetails {
  id: string;
  date: string;
  time: string;
  format: string;
  players_needed: number;
  handicap_range: string;
  description: string | null;
  status: string;
  created_at: string;
  organizer: ProfileRow;
  course: CourseRow;
  players: ProfileRow[];
}

// Fetch current user's profile
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
    enabled: !!user,
  });
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Pick<ProfileRow, 'name' | 'handicap' | 'home_club' | 'bio' | 'avatar_url'>>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Fetch all courses
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as CourseRow[];
    },
  });
}

// Fetch all rounds with details
export function useRounds() {
  return useQuery({
    queryKey: ['rounds'],
    queryFn: async () => {
      // Get rounds with organizer and course
      const { data: rounds, error } = await supabase
        .from('golf_rounds')
        .select(`
          *,
          organizer:profiles!organizer_id(*),
          course:golf_courses!course_id(*)
        `)
        .order('date', { ascending: true });
      if (error) throw error;

      // Get all round players
      const roundIds = rounds.map((r: any) => r.id);
      let playersMap: Record<string, ProfileRow[]> = {};
      
      if (roundIds.length > 0) {
        const { data: roundPlayers, error: rpError } = await supabase
          .from('round_players')
          .select(`
            round_id,
            profile:profiles!profile_id(*)
          `)
          .in('round_id', roundIds);
        if (rpError) throw rpError;

        roundPlayers?.forEach((rp: any) => {
          if (!playersMap[rp.round_id]) playersMap[rp.round_id] = [];
          playersMap[rp.round_id].push(rp.profile);
        });
      }

      return rounds.map((r: any) => ({
        id: r.id,
        date: r.date,
        time: r.time,
        format: r.format,
        players_needed: r.players_needed,
        handicap_range: r.handicap_range,
        description: r.description,
        status: r.status,
        created_at: r.created_at,
        organizer: r.organizer,
        course: r.course,
        players: playersMap[r.id] || [],
      })) as RoundWithDetails[];
    },
  });
}

// Fetch single round
export function useRound(roundId: string | undefined) {
  return useQuery({
    queryKey: ['round', roundId],
    queryFn: async () => {
      if (!roundId) return null;
      const { data: round, error } = await supabase
        .from('golf_rounds')
        .select(`
          *,
          organizer:profiles!organizer_id(*),
          course:golf_courses!course_id(*)
        `)
        .eq('id', roundId)
        .maybeSingle();
      if (error) throw error;
      if (!round) return null;

      const { data: roundPlayers, error: rpError } = await supabase
        .from('round_players')
        .select(`profile:profiles!profile_id(*)`)
        .eq('round_id', roundId);
      if (rpError) throw rpError;

      return {
        id: round.id,
        date: round.date,
        time: round.time,
        format: round.format,
        players_needed: round.players_needed,
        handicap_range: round.handicap_range,
        description: round.description,
        status: round.status,
        created_at: round.created_at,
        organizer: (round as any).organizer,
        course: (round as any).course,
        players: roundPlayers?.map((rp: any) => rp.profile) || [],
      } as RoundWithDetails;
    },
    enabled: !!roundId,
  });
}

// My rounds (where I'm organizer or player)
export function useMyRounds() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ['my-rounds', profile?.id],
    queryFn: async () => {
      if (!profile) return { upcoming: [], past: [] };

      // Rounds where I'm organizer
      const { data: organizedRounds } = await supabase
        .from('golf_rounds')
        .select('id')
        .eq('organizer_id', profile.id);

      // Rounds where I'm a player
      const { data: joinedRounds } = await supabase
        .from('round_players')
        .select('round_id')
        .eq('profile_id', profile.id);

      const myRoundIds = new Set([
        ...(organizedRounds?.map(r => r.id) || []),
        ...(joinedRounds?.map(r => r.round_id) || []),
      ]);

      if (myRoundIds.size === 0) return { upcoming: [], past: [] };

      const { data: rounds, error } = await supabase
        .from('golf_rounds')
        .select(`
          *,
          organizer:profiles!organizer_id(*),
          course:golf_courses!course_id(*)
        `)
        .in('id', Array.from(myRoundIds))
        .order('date', { ascending: true });
      if (error) throw error;

      // Get players for all these rounds
      const { data: allPlayers } = await supabase
        .from('round_players')
        .select(`round_id, profile:profiles!profile_id(*)`)
        .in('round_id', Array.from(myRoundIds));

      const playersMap: Record<string, ProfileRow[]> = {};
      allPlayers?.forEach((rp: any) => {
        if (!playersMap[rp.round_id]) playersMap[rp.round_id] = [];
        playersMap[rp.round_id].push(rp.profile);
      });

      const today = new Date().toISOString().split('T')[0];
      const mapped = rounds?.map((r: any) => ({
        id: r.id,
        date: r.date,
        time: r.time,
        format: r.format,
        players_needed: r.players_needed,
        handicap_range: r.handicap_range,
        description: r.description,
        status: r.status,
        created_at: r.created_at,
        organizer: r.organizer,
        course: r.course,
        players: playersMap[r.id] || [],
      })) as RoundWithDetails[] || [];

      return {
        upcoming: mapped.filter(r => r.date >= today && r.status !== 'completed'),
        past: mapped.filter(r => r.date < today || r.status === 'completed'),
      };
    },
    enabled: !!profile,
  });
}

// Create round
export function useCreateRound() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (input: {
      course_id: string;
      date: string;
      time: string;
      format: string;
      players_needed: number;
      handicap_range: string;
      description?: string;
    }) => {
      if (!profile) throw new Error('Profile not found');
      
      // Create the round
      const { data: round, error } = await supabase
        .from('golf_rounds')
        .insert({
          organizer_id: profile.id,
          course_id: input.course_id,
          date: input.date,
          time: input.time,
          format: input.format,
          players_needed: input.players_needed,
          handicap_range: input.handicap_range,
          description: input.description || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Auto-join the organizer as a player
      await insertRoundPlayerWithCompatibility(round.id, profile.id);

      return round;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['my-rounds'] });
    },
  });
}

// Join round
export function useJoinRound() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (roundId: string) => {
      if (!profile) throw new Error('Profile not found');
      await insertRoundPlayerWithCompatibility(roundId, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['round'] });
      queryClient.invalidateQueries({ queryKey: ['my-rounds'] });
    },
  });
}

// Leave round (handles host transfer / round deletion)
export function useLeaveRound() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ roundId, isOrganizer, otherPlayers }: {
      roundId: string;
      isOrganizer: boolean;
      otherPlayers: ProfileRow[];
    }) => {
      if (!profile) throw new Error('Profile not found');

      if (isOrganizer && otherPlayers.length === 0) {
        // Host leaves alone → delete the round (cascade will clean round_players & conversation)
        const { error } = await supabase
          .from('golf_rounds')
          .delete()
          .eq('id', roundId);
        if (error) throw error;
        return 'deleted' as const;
      }

      if (isOrganizer && otherPlayers.length > 0) {
        // Transfer host to earliest joined player, then leave
        const { data: earliest, error: fetchErr } = await supabase
          .from('round_players')
          .select('profile_id')
          .eq('round_id', roundId)
          .neq('profile_id', profile.id)
          .order('joined_at', { ascending: true })
          .limit(1)
          .single();
        if (fetchErr) throw fetchErr;

        const { error: transferErr } = await supabase
          .from('golf_rounds')
          .update({ organizer_id: earliest.profile_id })
          .eq('id', roundId);
        if (transferErr) throw transferErr;
      }

      // Remove the player
      const { error } = await supabase
        .from('round_players')
        .delete()
        .eq('round_id', roundId)
        .eq('profile_id', profile.id);
      if (error) throw error;
      return 'left' as const;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['round'] });
      queryClient.invalidateQueries({ queryKey: ['my-rounds'] });
    },
  });
}
