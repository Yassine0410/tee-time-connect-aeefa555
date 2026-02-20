import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Flag, Share2, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useRound, useProfile, useJoinRound, useLeaveRound } from '@/hooks/useGolfData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RoundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: round, isLoading } = useRound(id);
  const { data: profile } = useProfile();
  const joinRound = useJoinRound();
  const leaveRound = useLeaveRound();

  if (isLoading) {
    return (
      <div className="screen-content">
        <Header title="Round Details" showBack />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="screen-content">
        <Header title="Round Not Found" showBack />
        <div className="text-center py-12">
          <p className="text-muted-foreground">This round doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="btn-golf-primary mt-4">Back to Home</button>
        </div>
      </div>
    );
  }

  const hasJoined = profile ? round.players.some(p => p.id === profile.id) : false;
  const spotsLeft = round.players_needed - round.players.length;
  const isFull = spotsLeft <= 0;
  const formattedDate = format(parseISO(round.date), 'EEEE, MMMM d, yyyy');
  const isOrganizer = profile ? round.organizer.id === profile.id : false;

  const handleJoinLeave = async () => {
    if (!id) return;
    try {
      if (hasJoined) {
        await leaveRound.mutateAsync(id);
        toast.success('You left the round');
      } else {
        await joinRound.mutateAsync(id);
        toast.success('You joined the round!', { description: `See you at ${round.course.name}!` });
      }
    } catch (err: any) {
      toast.error('Action failed', { description: err.message });
    }
  };

  const handleShare = () => {
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="screen-content">
      <Header 
        title="Round Details"
        showBack
        action={
          <button onClick={handleShare} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Share2 size={20} />
          </button>
        }
      />

      {/* Main Info Card */}
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
            {isFull && !hasJoined ? 'Full' : `${spotsLeft} spots left`}
          </div>
        </div>

        <div className="golf-divider" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-foreground text-sm">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tee Time</p>
              <p className="font-medium text-foreground text-sm">{round.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flag size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Format</p>
              <p className="font-medium text-foreground text-sm">{round.format}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="font-medium text-foreground text-sm">HCP {round.handicap_range}</p>
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

      {/* Organizer */}
      <div className="golf-card mb-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">ORGANIZED BY</h3>
        <div className="flex items-center gap-3">
          <PlayerAvatar name={round.organizer.name} avatarUrl={round.organizer.avatar_url || undefined} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">{round.organizer.name}</p>
            <p className="text-sm text-muted-foreground">{round.organizer.home_club}</p>
          </div>
          <span className="golf-badge-primary">HCP {round.organizer.handicap}</span>
        </div>
      </div>

      {/* Players List */}
      <div className="golf-card mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            PLAYERS ({round.players.length}/{round.players_needed})
          </h3>
          <div className="flex -space-x-1">
            {Array.from({ length: round.players_needed }).map((_, i) => (
              <div key={i} className={cn(
                'w-3 h-3 rounded-full border-2 border-card',
                i < round.players.length ? 'bg-primary' : 'bg-muted'
              )} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {round.players.map((player) => (
            <div key={player.id} className={cn(
              "flex items-center gap-3 py-2",
              profile && player.id === profile.id && "bg-primary/5 -mx-4 px-4 rounded-lg"
            )}>
              <PlayerAvatar name={player.name} avatarUrl={player.avatar_url || undefined} size="md" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {player.name}{profile && player.id === profile.id ? ' (You)' : ''}
                </p>
                <p className="text-xs text-muted-foreground">{player.home_club}</p>
              </div>
              <span className={cn(
                "text-xs",
                profile && player.id === profile.id ? "golf-badge-primary" : "golf-badge-muted"
              )}>
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
                {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isOrganizer && (
          <button 
            onClick={handleJoinLeave}
            disabled={joinRound.isPending || leaveRound.isPending || (isFull && !hasJoined)}
            className={cn(
              'w-full text-lg transition-all duration-200 disabled:opacity-50',
              hasJoined ? 'btn-golf-outline' : 'btn-golf-accent'
            )}
          >
            {hasJoined ? (
              <><UserMinus size={20} className="inline mr-2" />Leave Round</>
            ) : isFull ? (
              'Round is Full'
            ) : (
              <><UserPlus size={20} className="inline mr-2" />Join This Round</>
            )}
          </button>
        )}
        
        <button className="btn-golf-outline w-full">
          <MessageCircle size={18} className="inline mr-2" />
          Message Organizer
        </button>
      </div>
    </div>
  );
}
