import { Trophy, Medal, Award } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useRounds, useProfile } from '@/hooks/useGolfData';

interface PlayerRanking {
  id: string;
  name: string;
  handicap: number;
  avatar_url: string | null;
  wins: number;
  played: number;
}

function computeRankings(rounds: ReturnType<typeof useRounds>['data'], currentProfileId?: string): PlayerRanking[] {
  if (!rounds) return [];
  
  const completedRounds = rounds.filter(r => r.status === 'completed' || r.status === 'full');
  const statsMap = new Map<string, PlayerRanking>();

  completedRounds.forEach(round => {
    round.players.forEach(p => {
      if (!statsMap.has(p.id)) {
        statsMap.set(p.id, { id: p.id, name: p.name, handicap: p.handicap, avatar_url: p.avatar_url, wins: 0, played: 0 });
      }
      statsMap.get(p.id)!.played += 1;
    });
    // Winner = lowest handicap
    const winner = [...round.players].sort((a, b) => a.handicap - b.handicap)[0];
    if (winner && statsMap.has(winner.id)) {
      statsMap.get(winner.id)!.wins += 1;
    }
  });

  return Array.from(statsMap.values())
    .sort((a, b) => b.wins - a.wins || a.handicap - b.handicap);
}

const rankIcons = [
  { icon: Trophy, color: 'text-yellow-500' },
  { icon: Medal, color: 'text-gray-400' },
  { icon: Award, color: 'text-amber-700' },
];

export default function Leaderboard() {
  const { data: rounds, isLoading } = useRounds();
  const { data: profile } = useProfile();
  const rankings = computeRankings(rounds, profile?.id);

  if (isLoading) {
    return (
      <div className="screen-content">
        <Header title="Classement" subtitle="Basé sur les victoires" />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="screen-content">
        <Header title="Classement" subtitle="Basé sur les victoires" />
        <div className="text-center py-12">
          <Trophy size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">No rankings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Rankings will appear once rounds are completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-content">
      <Header title="Classement" subtitle="Basé sur les victoires" />

      {/* Podium - Top 3 */}
      {rankings.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8 mt-2">
          {[1, 0, 2].map((rankIndex) => {
            const entry = rankings[rankIndex];
            if (!entry) return null;
            const isFirst = rankIndex === 0;
            const RankIcon = rankIcons[rankIndex].icon;

            return (
              <div
                key={entry.id}
                className={`flex flex-col items-center animate-fade-in ${isFirst ? 'order-2' : rankIndex === 1 ? 'order-1' : 'order-3'}`}
              >
                <RankIcon size={isFirst ? 28 : 22} className={rankIcons[rankIndex].color} />
                <PlayerAvatar
                  name={entry.name}
                  avatarUrl={entry.avatar_url || undefined}
                  size={isFirst ? 'lg' : 'md'}
                  showRing={isFirst}
                  className="mt-1"
                />
                <p className={`font-semibold text-foreground mt-2 text-center leading-tight ${isFirst ? 'text-sm' : 'text-xs'}`}>
                  {entry.name.split(' ')[0]}
                </p>
                <span className="golf-badge-primary mt-1 text-[10px]">
                  {entry.wins} {entry.wins > 1 ? 'victoires' : 'victoire'}
                </span>
                <div className={`w-20 rounded-t-xl mt-2 bg-gradient-golf opacity-90 ${
                  isFirst ? 'h-24' : rankIndex === 1 ? 'h-16' : 'h-12'
                }`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full Ranking List */}
      <div className="golf-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Tous les joueurs</h3>
        </div>
        {rankings.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              index !== rankings.length - 1 ? 'border-b border-border' : ''
            } ${profile && entry.id === profile.id ? 'bg-primary/5' : ''}`}
          >
            <span className={`w-7 text-center font-bold text-sm ${
              index < 3 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {index + 1}
            </span>
            <PlayerAvatar name={entry.name} avatarUrl={entry.avatar_url || undefined} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {entry.name}
                {profile && entry.id === profile.id && (
                  <span className="text-xs text-muted-foreground ml-1">(vous)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">HCP {entry.handicap}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground text-sm">{entry.wins}</p>
              <p className="text-[10px] text-muted-foreground">{entry.played} jouées</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
