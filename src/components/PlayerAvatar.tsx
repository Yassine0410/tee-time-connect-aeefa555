import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface PlayerAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRing?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 22,
  xl: 32,
};

export function PlayerAvatar({ 
  name, 
  avatarUrl, 
  size = 'md', 
  showRing = false,
  className 
}: PlayerAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        'bg-gradient-to-br from-golf-green-400 to-golf-green-600 text-primary-foreground',
        sizeClasses[size],
        showRing && 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background',
        className
      )}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User size={iconSizes[size]} />
      )}
    </div>
  );
}

interface PlayerAvatarStackProps {
  players: Array<{ name: string; avatarUrl?: string }>;
  maxDisplay?: number;
  size?: 'sm' | 'md';
}

export function PlayerAvatarStack({ 
  players, 
  maxDisplay = 3,
  size = 'sm' 
}: PlayerAvatarStackProps) {
  const displayPlayers = players.slice(0, maxDisplay);
  const remaining = players.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayPlayers.map((player, index) => (
        <PlayerAvatar
          key={index}
          name={player.name}
          avatarUrl={player.avatarUrl}
          size={size}
          className="ring-2 ring-card"
        />
      ))}
      {remaining > 0 && (
        <div 
          className={cn(
            'rounded-full flex items-center justify-center font-medium',
            'bg-muted text-muted-foreground ring-2 ring-card',
            size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
