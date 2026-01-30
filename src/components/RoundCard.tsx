import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Flag } from 'lucide-react';
import { GolfRound } from '@/types/golf';
import { PlayerAvatarStack } from './PlayerAvatar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface RoundCardProps {
  round: GolfRound;
}

export function RoundCard({ round }: RoundCardProps) {
  const navigate = useNavigate();
  const spotsLeft = round.playersNeeded - round.currentPlayers.length;
  const isFull = spotsLeft === 0;
  
  const formattedDate = format(parseISO(round.date), 'EEE, MMM d');

  return (
    <button
      onClick={() => navigate(`/round/${round.id}`)}
      className="golf-card-hover w-full text-left animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base leading-tight mb-1">
            {round.course}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin size={14} className="shrink-0" />
            {round.courseLocation}
          </p>
        </div>
        <div className={cn(
          'shrink-0 ml-2',
          isFull ? 'status-full' : 'status-open'
        )}>
          {isFull ? 'Full' : `${spotsLeft} spots`}
        </div>
      </div>

      {/* Date, Time, Format Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-foreground">
          <Calendar size={15} className="text-primary" />
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-foreground">
          <Clock size={15} className="text-primary" />
          <span className="font-medium">{round.time}</span>
        </div>
        <div className="golf-badge-primary">
          <Flag size={12} className="mr-1" />
          {round.format}
        </div>
      </div>

      {/* Players & Handicap Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlayerAvatarStack players={round.currentPlayers} size="sm" />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users size={14} />
            <span>{round.currentPlayers.length}/{round.playersNeeded}</span>
          </div>
        </div>
        <div className="golf-badge-muted">
          HCP {round.handicapRange}
        </div>
      </div>

      {/* Description preview */}
      {round.description && (
        <p className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground line-clamp-2">
          {round.description}
        </p>
      )}
    </button>
  );
}
