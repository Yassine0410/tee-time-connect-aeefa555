import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile, type ProfileRow } from './useGolfData';

export interface Conversation {
  id: string;
  type: 'dm' | 'round';
  round_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: ProfileRow;
}

export interface ConversationWithDetails extends Conversation {
  participants: ProfileRow[];
  last_message?: Message;
  round_name?: string;
}

// Get or create a DM conversation with another user
export function useGetOrCreateDM() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherProfileId: string): Promise<string> => {
      if (!profile) throw new Error('Not authenticated');

      // Find existing DM between these two users
      const { data: myConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id);

      const { data: theirConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', otherProfileId);

      if (myConvs && theirConvs) {
        const myIds = new Set(myConvs.map(c => c.conversation_id));
        const commonIds = theirConvs
          .filter(c => myIds.has(c.conversation_id))
          .map(c => c.conversation_id);

        if (commonIds.length > 0) {
          // Check if any of these are DMs
          const { data: dmConvs } = await supabase
            .from('conversations')
            .select('id')
            .in('id', commonIds)
            .eq('type', 'dm');

          if (dmConvs && dmConvs.length > 0) {
            return dmConvs[0].id;
          }
        }
      }

      // Create new DM conversation
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ type: 'dm' })
        .select()
        .single();
      if (error) throw error;

      // Add both participants
      const { error: pError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conv.id, profile_id: profile.id },
          { conversation_id: conv.id, profile_id: otherProfileId },
        ]);
      if (pError) throw pError;

      return conv.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// List all conversations for the current user
export function useConversations() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['conversations', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      // Get conversation IDs the user is part of
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id);

      if (!participations || participations.length === 0) return [];

      const convIds = participations.map(p => p.conversation_id);

      // Get conversations
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get all participants for these conversations
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, profile:profiles!profile_id(*)')
        .in('conversation_id', convIds);

      // Get last message for each conversation
      const results: ConversationWithDetails[] = [];

      for (const conv of conversations || []) {
        const participants = allParticipants
          ?.filter(p => p.conversation_id === conv.id)
          .map((p: any) => p.profile) || [];

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get round name if it's a round chat
        let round_name: string | undefined;
        if (conv.type === 'round' && conv.round_id) {
          const { data: round } = await supabase
            .from('golf_rounds')
            .select('course:golf_courses!course_id(name)')
            .eq('id', conv.round_id)
            .maybeSingle();
          round_name = (round as any)?.course?.name;
        }

        results.push({
          ...conv,
          type: conv.type as 'dm' | 'round',
          participants,
          last_message: lastMsg || undefined,
          round_name,
        });
      }

      // Sort by last message or created_at
      results.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at;
        const bTime = b.last_message?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      return results;
    },
    enabled: !!profile,
  });
}

// Get messages for a conversation with realtime
export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      return (data || []).map((m: any) => ({
        ...m,
        sender: m.sender,
      })) as Message[];
    },
    enabled: !!conversationId,
  });
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!profile) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content,
        });
      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Get round conversation ID
export function useRoundConversation(roundId: string | undefined) {
  return useQuery({
    queryKey: ['round-conversation', roundId],
    queryFn: async () => {
      if (!roundId) return null;
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('round_id', roundId)
        .eq('type', 'round')
        .maybeSingle();
      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!roundId,
  });
}
