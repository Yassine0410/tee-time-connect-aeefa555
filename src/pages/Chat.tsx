import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useMessages, useSendMessage } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useGolfData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const { id: conversationId } = useParams();
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const { data: profile } = useProfile();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get conversation details for header
  const { data: convDetails } = useQuery({
    queryKey: ['conv-details', conversationId],
    queryFn: async () => {
      if (!conversationId || !profile) return null;

      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();
      if (!conv) return null;

      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('profile:profiles!profile_id(*)')
        .eq('conversation_id', conversationId);

      const others = (participants || [])
        .map((p: any) => p.profile)
        .filter((p: any) => p.id !== profile.id);

      let title = 'Chat';
      if (conv.type === 'round' && conv.round_id) {
        const { data: round } = await supabase
          .from('golf_rounds')
          .select('course:golf_courses!course_id(name)')
          .eq('id', conv.round_id)
          .maybeSingle();
        title = `⛳ ${(round as any)?.course?.name || 'Round Chat'}`;
      } else if (others.length > 0) {
        title = others[0].name;
      }

      return { ...conv, title, participants: others };
    },
    enabled: !!conversationId && !!profile,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !conversationId) return;
    const content = text.trim();
    setText('');
    try {
      await sendMessage.mutateAsync({ conversationId, content });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      <div className="shrink-0 px-4 pt-4">
        <Header title={convDetails?.title || 'Chat'} showBack />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === profile?.id;
            return (
              <div key={msg.id} className={cn('flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
                {!isMe && (
                  <PlayerAvatar
                    name={msg.sender?.name || 'U'}
                    avatarUrl={msg.sender?.avatar_url || undefined}
                    size="sm"
                  />
                )}
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border text-foreground rounded-bl-md'
                )}>
                  {!isMe && msg.sender && (
                    <p className="text-xs font-semibold text-primary mb-0.5">{msg.sender.name}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="golf-input flex-1 !py-2.5 !rounded-full"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-50 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
