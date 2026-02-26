import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Flag, Share2, UserPlus, UserMinus, MessagesSquare, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useRound, useProfile, useJoinRound, useLeaveRound } from '@/hooks/useGolfData';
import { useRoundConversation } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function RoundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: round, isLoading } = useRound(id);
  const { data: profile } = useProfile();
  const joinRound = useJoinRound();
  const leaveRound = useLeaveRound();
  const { data: roundConversationId } = useRoundConversation(id);
  const { t, dateLocale, formatLabel, handicapRangeText } = useLanguage();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="screen-content">
        <Header title={t('roundDetails.title')} showBack />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="screen-content">
        <Header title={t('roundDetails.notFoundTitle')} showBack />
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('roundDetails.notFoundMessage')}</p>
          <button onClick={() => navigate('/')} className="btn-golf-primary mt-4">
            {t('roundDetails.backHome')}
          </button>
        </div>
      </div>
    );
  }

  const hasJoined = profile ? round.players.some((p) => p.id === profile.id) : false;
  const spotsLeft = round.players_needed - round.players.length;
  const isFull = spotsLeft <= 0;
  const formattedDate = format(parseISO(round.date), 'EEEE, MMMM d, yyyy', { locale: dateLocale });
  const isOrganizer = profile ? round.organizer.id === profile.id : false;

  const otherPlayers = profile ? round.players.filter(p => p.id !== profile.id) : [];

  const handleJoin = async () => {
    if (!id) return;
    try {
      await joinRound.mutateAsync(id);
      toast.success(t('roundDetails.joinedRound'), {
        description: t('roundDetails.joinedRoundDesc', { course: round.course.name }),
      });
    } catch (err: any) {
      toast.error(t('roundDetails.actionFailed'), { description: err.message });
    }
  };

  const handleLeaveConfirmed = async () => {
    if (!id) return;
    try {
      const result = await leaveRound.mutateAsync({
        roundId: id,
        isOrganizer,
        otherPlayers,
      });
      if (result === 'deleted') {
        toast.success(t('roundDetails.roundDeleted'));
        navigate('/');
      } else if (isOrganizer) {
        toast.success(t('roundDetails.hostTransferred'));
      } else {
        toast.success(t('roundDetails.leftRound'));
      }
    } catch (err: any) {
      toast.error(t('roundDetails.actionFailed'), { description: err.message });
    }
  };

  const handleShare = () => {
    toast.success(t('roundDetails.linkCopied'));
  };

  const handleRoundChat = () => {
    if (roundConversationId) {
      navigate(`/chat/${roundConversationId}`);
    }
  };

  return (
    <div className="screen-content">
      <Header
        title={t('roundDetails.title')}
        showBack
        action={
          <button onClick={handleShare} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Share2 size={20} />
          </button>
        }
      />

      <div className="golf-card mb-4 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground font-serif leading-tight mb-1">{round.course.name}</h2>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <MapPin size={15} className="shrink-0" />
              {round.course.location}
            </p>
          </div>
          <div className={cn('shrink-0 ml-2', isFull && !hasJoined ? 'status-full' : 'status-open')}>
            {isFull && !hasJoined ? t('roundCard.full') : t('roundDetails.spotsLeft', { count: spotsLeft })}
          </div>
        </div>

        <div className="golf-divider" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('roundDetails.date')}</p>
              <p className="font-medium text-foreground text-sm">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('roundDetails.teeTime')}</p>
              <p className="font-medium text-foreground text-sm">{round.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flag size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('roundDetails.format')}</p>
              <p className="font-medium text-foreground text-sm">{formatLabel(round.format)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('roundDetails.level')}</p>
              <p className="font-medium text-foreground text-sm">HCP {handicapRangeText(round.min_handicap, round.max_handicap)}</p>
            </div>
          </div>
        </div>

        {round.description && (
          <>
            <div className="golf-divider" />
            <p className="text-sm text-muted-foreground">{round.description}</p>
          </>
        )}
      </div>

      <div className="golf-card mb-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('roundDetails.organizedBy')}</h3>
        <div className="flex items-center gap-3">
          <PlayerAvatar name={round.organizer.name} avatarUrl={round.organizer.avatar_url || undefined} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">{round.organizer.name}</p>
            <p className="text-sm text-muted-foreground">{round.organizer.home_club || t('common.notSet')}</p>
          </div>
          <span className="golf-badge-primary">HCP {round.organizer.handicap}</span>
        </div>
      </div>

      <div className="golf-card mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t('roundDetails.players', { current: round.players.length, total: round.players_needed })}
          </h3>
          <div className="flex -space-x-1">
            {Array.from({ length: round.players_needed }).map((_, i) => (
              <div
                key={i}
                className={cn('w-3 h-3 rounded-full border-2 border-card', i < round.players.length ? 'bg-primary' : 'bg-muted')}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {round.players.map((player) => (
            <div
              key={player.id}
              className={cn(
                'flex items-center gap-3 py-2',
                profile && player.id === profile.id && 'bg-primary/5 -mx-4 px-4 rounded-lg'
              )}
            >
              <PlayerAvatar name={player.name} avatarUrl={player.avatar_url || undefined} size="md" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {player.name}
                  {profile && player.id === profile.id ? ` ${t('roundDetails.you')}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">{player.home_club || t('common.notSet')}</p>
              </div>
              <span className={cn('text-xs', profile && player.id === profile.id ? 'golf-badge-primary' : 'golf-badge-muted')}>
                HCP {player.handicap}
              </span>
            </div>
          ))}
          {spotsLeft > 0 && (
            <div className="flex items-center gap-3 py-2 opacity-50">
              <div className="w-10 h-10 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                <UserPlus size={16} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('roundDetails.spotAvailable', {
                  count: spotsLeft,
                  word: spotsLeft === 1 ? t('roundDetails.spot') : t('roundDetails.spotsWord'),
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Join button for non-hosts who haven't joined */}
        {!isOrganizer && !hasJoined && (
          <button
            onClick={handleJoin}
            disabled={joinRound.isPending || isFull}
            className={cn('w-full text-lg transition-all duration-200 disabled:opacity-50', 'btn-golf-accent')}
          >
            {isFull ? (
              t('roundDetails.roundIsFull')
            ) : (
              <>
                <UserPlus size={20} className="inline mr-2" />
                {t('roundDetails.joinRound')}
              </>
            )}
          </button>
        )}

        {/* Leave button for anyone who has joined (including host) */}
        {hasJoined && (
          <button
            onClick={() => setShowLeaveDialog(true)}
            disabled={leaveRound.isPending}
            className="btn-golf-outline w-full text-lg transition-all duration-200 disabled:opacity-50"
          >
            <UserMinus size={20} className="inline mr-2" />
            {t('roundDetails.leaveRound')}
          </button>
        )}

        {hasJoined && roundConversationId && (
          <button onClick={handleRoundChat} className="btn-golf-outline w-full">
            <MessagesSquare size={18} className="inline mr-2" />
            {t('roundDetails.groupChat')}
          </button>
        )}

        {hasJoined && round.status === 'completed' && (
          <button onClick={() => navigate(`/round/${round.id}/reviews`)} className="btn-golf-outline w-full">
            <Flag size={18} className="inline mr-2" />
            {t('roundDetails.leaveReview')}
          </button>
        )}
      </div>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              {t('roundDetails.leaveConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isOrganizer && otherPlayers.length === 0
                ? t('roundDetails.leaveConfirmHost_noPlayers')
                : isOrganizer
                ? t('roundDetails.leaveConfirmHost_withPlayers')
                : t('roundDetails.leaveConfirmPlayer')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('roundDetails.leaveConfirmCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isOrganizer && otherPlayers.length === 0
                ? t('roundDetails.leaveConfirmDeleteAction')
                : t('roundDetails.leaveConfirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
