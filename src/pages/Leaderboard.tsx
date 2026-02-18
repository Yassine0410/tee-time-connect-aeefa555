import { Trophy, Medal, Award } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { mockPlayers, mockRounds } from '@/data/mockData';
import { currentPlayer } from '@/data/mockData';

interface PlayerRanking {
  player: typeof mockPlayers[0];
  wins: number;
  played: number;
}

function computeRankings(): PlayerRanking[] {
  const allPlayers = [currentPlayer, ...mockPlayers];
  const completedRounds = mockRounds.filter(r => r.status === 'completed' || r.status === 'full');

  const statsMap = new Map<string, { wins: number; played: number }>();

  allPlayers.forEach(p => statsMap.set(p.id, { wins: 0, played: 0 }));

  completedRounds.forEach(round => {
    round.currentPlayers.forEach(p => {
      const stat = statsMap.get(p.id);
      if (stat) stat.played += 1;
    });
    // Simulate a winner: the player with lowest handicap wins
    const winner = [...round.currentPlayers].sort((a, b) => a.handicap - b.handicap)[0];
    if (winner) {
      const stat = statsMap.get(winner.id);
      if (stat) stat.wins += 1;
    }
  });

  return allPlayers
    .map(player => ({
      player,
      wins: statsMap.get(player.id)?.wins ?? 0,
      played: statsMap.get(player.id)?.played ?? 0,
    }))
    .sort((a, b) => b.wins - a.wins || a.player.handicap - b.player.handicap);
}

const rankIcons = [
  { icon: Trophy, color: 'text-yellow-500' },
  { icon: Medal, color: 'text-gray-400' },
  { icon: Award, color: 'text-amber-700' },
];

export default function Leaderboard() {
  const rankings = computeRankings();

  return (
    <div className="screen-content">
      <Header title="Classement" subtitle="Basé sur les victoires" />

      {/* Podium - Top 3 */}
      <div className="flex items-end justify-center gap-3 mb-8 mt-2">
        {[1, 0, 2].map((rankIndex) => {
          const entry = rankings[rankIndex];
          if (!entry) return null;
          const isFirst = rankIndex === 0;
          const RankIcon = rankIcons[rankIndex].icon;

          return (
            <div
              key={entry.player.id}
              className={`flex flex-col items-center animate-fade-in ${isFirst ? 'order-2' : rankIndex === 1 ? 'order-1' : 'order-3'}`}
            >
              <RankIcon size={isFirst ? 28 : 22} className={rankIcons[rankIndex].color} />
              <PlayerAvatar
                name={entry.player.name}
                avatarUrl={entry.player.avatarUrl}
                size={isFirst ? 'lg' : 'md'}
                showRing={isFirst}
                className="mt-1"
              />
              <p className={`font-semibold text-foreground mt-2 text-center leading-tight ${isFirst ? 'text-sm' : 'text-xs'}`}>
                {entry.player.name.split(' ')[0]}
              </p>
              <span className="golf-badge-primary mt-1 text-[10px]">
                {entry.wins} {entry.wins > 1 ? 'victoires' : 'victoire'}
              </span>
              <div
                className={`w-20 rounded-t-xl mt-2 bg-gradient-golf opacity-90 ${
                  isFirst ? 'h-24' : rankIndex === 1 ? 'h-16' : 'h-12'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Full Ranking List */}
      <div className="golf-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Tous les joueurs</h3>
        </div>
        {rankings.map((entry, index) => (
          <div
            key={entry.player.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              index !== rankings.length - 1 ? 'border-b border-border' : ''
            } ${entry.player.id === currentPlayer.id ? 'bg-primary/5' : ''}`}
          >
            <span className={`w-7 text-center font-bold text-sm ${
              index < 3 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {index + 1}
            </span>
            <PlayerAvatar
              name={entry.player.name}
              avatarUrl={entry.player.avatarUrl}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {entry.player.name}
                {entry.player.id === currentPlayer.id && (
                  <span className="text-xs text-muted-foreground ml-1">(vous)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">HCP {entry.player.handicap}</p>
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
