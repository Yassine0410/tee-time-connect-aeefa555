import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Flag } from 'lucide-react';
import { PlayerAvatarStack } from './PlayerAvatar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { RoundWithDetails } from '@/hooks/useGolfData';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoundCardProps {
  round: RoundWithDetails;
}

export function RoundCard({ round }: RoundCardProps) {
  const navigate = useNavigate();
  const { t, dateLocale, formatLabel, handicapLabel } = useLanguage();
  const spotsLeft = round.players_needed - round.players.length;
  const isFull = spotsLeft <= 0;
  
  const formattedDate = format(parseISO(round.date), 'EEE, MMM d', { locale: dateLocale });

  return (
    <button
      onClick={() => navigate(`/round/${round.id}`)}
      className="golf-card-hover w-full text-left animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base leading-tight mb-1">
            {round.course.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin size={14} className="shrink-0" />
            {round.course.location}
          </p>
        </div>
        <div className={cn(
          'shrink-0 ml-2',
          isFull ? 'status-full' : 'status-open'
        )}>
          {isFull ? t('roundCard.full') : t('roundCard.spots', { count: spotsLeft })}
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
          {formatLabel(round.format)}
        </div>
      </div>

      {/* Players & Handicap Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlayerAvatarStack 
            players={round.players.map(p => ({ name: p.name, avatarUrl: p.avatar_url || undefined }))} 
            size="sm" 
          />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users size={14} />
            <span>{round.players.length}/{round.players_needed}</span>
          </div>
        </div>
        <div className="golf-badge-muted">
          HCP {handicapLabel(round.handicap_range)}
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
