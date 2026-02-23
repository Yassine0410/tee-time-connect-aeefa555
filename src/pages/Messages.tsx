import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useConversations } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useGolfData';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Messages() {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useConversations();
  const { data: profile } = useProfile();

  return (
    <div className="screen-content">
      <Header title="Messages" />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !conversations || conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">Join a round to start chatting!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const otherParticipants = conv.participants.filter(p => p.id !== profile?.id);
            const displayName = conv.type === 'round'
              ? `⛳ ${conv.round_name || 'Round Chat'}`
              : otherParticipants[0]?.name || 'Unknown';
            const avatarName = conv.type === 'round'
              ? conv.round_name || 'Round'
              : otherParticipants[0]?.name || 'U';
            const avatarUrl = conv.type === 'dm' ? otherParticipants[0]?.avatar_url || undefined : undefined;
            const timeAgo = conv.last_message
              ? formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true, locale: fr })
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
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
