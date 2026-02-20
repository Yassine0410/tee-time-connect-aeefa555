import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatarStack } from '@/components/PlayerAvatar';
import { useMyRounds } from '@/hooks/useGolfData';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function MyRounds() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyRounds();
  const myRounds = data?.upcoming || [];
  const pastRounds = data?.past || [];

  return (
    <div className="screen-content">
      <Header 
        title="My Rounds"
        subtitle="Your upcoming and past games"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Upcoming Section */}
          <section className="mb-8">
            <h2 className="section-header">Upcoming</h2>
            {myRounds.length > 0 ? (
              <div className="space-y-3">
                {myRounds.map((round) => (
                  <button
                    key={round.id}
                    onClick={() => navigate(`/round/${round.id}`)}
                    className="golf-card-hover w-full text-left animate-fade-in"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-golf text-primary-foreground rounded-xl p-3 text-center min-w-[60px]">
                        <p className="text-2xl font-bold leading-none">
                          {format(parseISO(round.date), 'd')}
                        </p>
                        <p className="text-xs opacity-90 uppercase mt-0.5">
                          {format(parseISO(round.date), 'MMM')}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{round.course.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {round.time}
                          </span>
                          <span className="golf-badge-muted text-xs">{round.format}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <PlayerAvatarStack 
                            players={round.players.map(p => ({ name: p.name, avatarUrl: p.avatar_url || undefined }))} 
                            size="sm" 
                            maxDisplay={3} 
                          />
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="golf-card text-center py-8">
                <Calendar size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-foreground font-medium">No upcoming rounds</p>
                <p className="text-sm text-muted-foreground mt-1">Find a round to join or create your own!</p>
                <button 
                  onClick={() => navigate('/create')}
                  className="btn-golf-primary mt-4"
                >
                  Create a Round
                </button>
              </div>
            )}
          </section>

          {/* Past Rounds Section */}
          <section>
            <h2 className="section-header">Past Rounds</h2>
            {pastRounds.length > 0 ? (
              <div className="space-y-3">
                {pastRounds.map((round) => (
                  <div key={round.id} className="golf-card opacity-75">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted text-muted-foreground rounded-xl p-3 text-center min-w-[60px]">
                        <p className="text-2xl font-bold leading-none">
                          {format(parseISO(round.date), 'd')}
                        </p>
                        <p className="text-xs uppercase mt-0.5">
                          {format(parseISO(round.date), 'MMM')}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{round.course.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {round.course.location}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Played with {round.players.length} golfers
                        </p>
                      </div>
                      <span className="golf-badge-muted">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No past rounds yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
