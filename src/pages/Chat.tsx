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
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

function shortenCourseName(name: string) {
  return name
    .replace(/\s+(golf\s+links|golf\s+club|golf\s+course)\s*$/i, '')
    .replace(/\s+\(.*\)\s*$/i, '')
    .trim();
}

export default function Chat() {
  const { id: conversationId } = useParams();
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const { data: profile } = useProfile();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t, language, dateLocale } = useLanguage();

  const { data: convDetails } = useQuery({
    queryKey: ['conv-details', conversationId, language],
    queryFn: async () => {
      if (!conversationId || !profile) return null;

      const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).maybeSingle();
      if (!conv) return null;

      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('profile:profiles!profile_id(*)')
        .eq('conversation_id', conversationId);

      const others = (participants || []).map((p: any) => p.profile).filter((p: any) => p.id !== profile.id);

      let title = t('chat.title');
      let subtitle: string | undefined;
      if (conv.type === 'round' && conv.round_id) {
        const { data: round } = await supabase
          .from('golf_rounds')
          .select('date, time, course:golf_courses!course_id(name)')
          .eq('id', conv.round_id)
          .maybeSingle();

        const courseName = shortenCourseName((round as any)?.course?.name || t('chat.roundChatDefault'));
        title = courseName || t('chat.roundChatDefault');

        const dateText = (round as any)?.date ? format(parseISO((round as any).date), 'EEEE d MMM', { locale: dateLocale }) : '';
        const normalizedDateText = dateText ? dateText.charAt(0).toUpperCase() + dateText.slice(1) : '';
        const timeText = (round as any)?.time ? String((round as any).time) : '';
        subtitle = [normalizedDateText, timeText].filter(Boolean).join(' · ') || undefined;
      } else if (others.length > 0) {
        title = others[0].name;
      }

      return { ...conv, title, subtitle, participants: others };
    },
    enabled: !!conversationId && !!profile,
  });

  const typing = useTypingIndicator({
    conversationId,
    self: profile ? { id: profile.id, name: profile.name } : null,
    participants: convDetails?.participants?.map((p: any) => ({ id: p.id, name: p.name })) || [],
  });

  const typingNames = (typing.typingUserIds || []).map((userId) => {
    const name = convDetails?.participants?.find((p: any) => p.id === userId)?.name;
    return name || t('common.user');
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !conversationId) return;
    const content = text.trim();
    setText('');
    await typing.stopTyping();
    try {
      await sendMessage.mutateAsync({ conversationId, content });
    } catch (err: any) {
      toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      <div className="shrink-0 px-4 pt-4">
        <Header title={convDetails?.title || t('chat.title')} subtitle={convDetails?.subtitle} showBack />
        <div className="min-h-4 mt-1 px-0.5 text-xs text-muted-foreground">
          {typingNames.length > 0
            ? typingNames.length === 1
              ? t('chat.typingSingle', { name: typingNames[0] })
              : typingNames.length === 2
              ? t('chat.typingMultiple', { names: `${typingNames[0]} ${t('common.and')} ${typingNames[1]}` })
              : t('chat.typingMany', { names: `${typingNames[0]}, ${typingNames[1]}`, count: typingNames.length - 2 })
            : ''}
        </div>
      </div>

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
                {!isMe && <PlayerAvatar name={msg.sender?.name || t('common.user')} avatarUrl={msg.sender?.avatar_url || undefined} size="sm" />}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border text-foreground rounded-bl-md'
                  )}
                >
                  {!isMe && msg.sender && <p className="text-xs font-semibold text-primary mb-0.5">{msg.sender.name}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn('text-[10px] mt-1', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">{t('chat.empty')}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 p-4 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => {
              const next = e.target.value;
              setText(next);
              typing.onTextChanged(next);
            }}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('chat.inputPlaceholder')}
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
