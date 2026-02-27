import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TypingEventPayload = {
  userId?: string;
  isTyping?: boolean;
};

type Participant = { id: string; name: string };

const TYPING_TTL_MS = 2500;
const TYPING_REFRESH_MS = 1200;
const TYPING_STOP_DEBOUNCE_MS = 2200;

export function useTypingIndicator(params: {
  conversationId: string | undefined;
  self: Participant | null | undefined;
  participants: Participant[] | undefined;
}) {
  const { conversationId, self, participants } = params;

  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const expiryTimeoutsRef = useRef(new Map<string, number>());

  const stopDebounceRef = useRef<number | null>(null);
  const lastTypingSendAtRef = useRef<number>(0);
  const isTypingRef = useRef(false);

  const participantNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of participants || []) map.set(p.id, p.name);
    if (self) map.set(self.id, self.name);
    return map;
  }, [participants, self]);

  const scheduleExpiry = useCallback((userId: string) => {
    const existing = expiryTimeoutsRef.current.get(userId);
    if (existing) window.clearTimeout(existing);

    const timeoutId = window.setTimeout(() => {
      setTypingUserIds((prev) => prev.filter((id) => id !== userId));
      expiryTimeoutsRef.current.delete(userId);
    }, TYPING_TTL_MS);

    expiryTimeoutsRef.current.set(userId, timeoutId);
  }, []);

  const clearAllExpiryTimeouts = useCallback(() => {
    for (const [, timeoutId] of expiryTimeoutsRef.current) {
      window.clearTimeout(timeoutId);
    }
    expiryTimeoutsRef.current.clear();
  }, []);

  const sendTypingEvent = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId || !self?.id) return;
      const channel = channelRef.current;
      if (!channel) return;

      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: self.id, isTyping } satisfies TypingEventPayload,
      });
    },
    [conversationId, self?.id]
  );

  const stopTyping = useCallback(async () => {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    lastTypingSendAtRef.current = 0;
    if (stopDebounceRef.current) {
      window.clearTimeout(stopDebounceRef.current);
      stopDebounceRef.current = null;
    }
    await sendTypingEvent(false);
  }, [sendTypingEvent]);

  const startTyping = useCallback(async () => {
    if (!conversationId || !self?.id) return;

    const now = Date.now();
    const shouldRefresh = now - lastTypingSendAtRef.current >= TYPING_REFRESH_MS;
    if (!isTypingRef.current || shouldRefresh) {
      isTypingRef.current = true;
      lastTypingSendAtRef.current = now;
      await sendTypingEvent(true);
    }

    if (stopDebounceRef.current) window.clearTimeout(stopDebounceRef.current);
    stopDebounceRef.current = window.setTimeout(() => {
      void stopTyping();
    }, TYPING_STOP_DEBOUNCE_MS);
  }, [conversationId, self?.id, sendTypingEvent, stopTyping]);

  const onTextChanged = useCallback(
    (nextText: string) => {
      if (!conversationId || !self?.id) return;
      if (nextText.trim().length === 0) {
        void stopTyping();
        return;
      }
      void startTyping();
    },
    [conversationId, self?.id, startTyping, stopTyping]
  );

  useEffect(() => {
    if (!conversationId || !self?.id) return;

    const channel = supabase.channel(`typing-${conversationId}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: TypingEventPayload }) => {
        const userId = payload?.userId;
        const isTyping = payload?.isTyping;
        if (!userId || userId === self.id) return;

        if (isTyping) {
          setTypingUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
          scheduleExpiry(userId);
        } else {
          setTypingUserIds((prev) => prev.filter((id) => id !== userId));
          const existing = expiryTimeoutsRef.current.get(userId);
          if (existing) window.clearTimeout(existing);
          expiryTimeoutsRef.current.delete(userId);
        }
      })
      .subscribe();

    channelRef.current = channel;

    const handlePageHide = () => void stopTyping();
    const handleVisibilityChange = () => {
      if (document.hidden) void stopTyping();
    };
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void stopTyping();
      clearAllExpiryTimeouts();
      supabase.removeChannel(channel);
      channelRef.current = null;
      setTypingUserIds([]);
    };
  }, [conversationId, self?.id, clearAllExpiryTimeouts, scheduleExpiry, stopTyping]);

  const typingNames = useMemo(() => {
    return typingUserIds
      .map((id) => participantNameById.get(id))
      .filter(Boolean) as string[];
  }, [participantNameById, typingUserIds]);

  return {
    typingUserIds,
    typingNames,
    onTextChanged,
    stopTyping,
  };
}
