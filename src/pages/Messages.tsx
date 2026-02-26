import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useConversations } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useGolfData';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Messages() {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useConversations();
  const { data: profile } = useProfile();
  const { t, dateLocale } = useLanguage();
  const visibleConversations = (conversations || []).filter((conv) => !!conv.last_message);

  return (
    <div className="screen-content">
      <Header title={t('messages.title')} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibleConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{t('messages.emptyTitle')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('messages.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleConversations.map((conv) => {
            const otherParticipants = conv.participants.filter((p) => p.id !== profile?.id);
            const displayName =
              conv.type === 'round'
                ? `${t('messages.roundPrefix')}: ${conv.round_name || t('messages.roundChatDefault')}`
                : otherParticipants[0]?.name || t('common.unknown');
            const avatarName = conv.type === 'round' ? conv.round_name || t('messages.roundChatDefault') : otherParticipants[0]?.name || t('common.user');
            const avatarUrl = conv.type === 'dm' ? otherParticipants[0]?.avatar_url || undefined : undefined;
            const timeAgo = conv.last_message
              ? formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true, locale: dateLocale })
              : '';

            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="golf-card-hover w-full text-left flex items-center gap-3 py-3"
              >
                {conv.type === 'round' ? (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users size={22} className="text-primary" />
                  </div>
                ) : (
                  <PlayerAvatar name={avatarName} avatarUrl={avatarUrl} size="lg" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground truncate">{displayName}</p>
                    {timeAgo && <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeAgo}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.last_message!.content}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
