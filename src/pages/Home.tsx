import { useState } from 'react';
import { Search, Filter, Circle } from 'lucide-react';
import { RoundCard } from '@/components/RoundCard';
import { RoundWithDetails, useProfile, useRounds } from '@/hooks/useGolfData';
import { useLanguage } from '@/contexts/LanguageContext';
import { isHandicapInRange } from '@/lib/handicapRange';

function getRoundStartDate(round: RoundWithDetails) {
  const [year, month, day] = round.date.split('-').map(Number);
  const [hours = 0, minutes = 0] = round.time.split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

function isUpcomingRound(round: RoundWithDetails, now: Date) {
  return getRoundStartDate(round).getTime() > now.getTime();
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const { data: rounds = [], isLoading } = useRounds();
  const { data: profile } = useProfile();
  const { t, formatLabel } = useLanguage();
  const now = new Date();

  const upcomingRounds = rounds.filter((round) => isUpcomingRound(round, now));
  const openCount = upcomingRounds.filter(r => r.status === 'open').length;

  const filteredRounds = upcomingRounds.filter((round) => {
    const localizedFormat = formatLabel(round.format).toLowerCase();
    const normalizedQuery = searchQuery.toLowerCase();
    const matchesSearch = 
      round.course.name.toLowerCase().includes(normalizedQuery) ||
      round.course.location.toLowerCase().includes(normalizedQuery) ||
      round.format.toLowerCase().includes(normalizedQuery) ||
      localizedFormat.includes(normalizedQuery);
    
    const matchesFilter = !showOpenOnly || round.status === 'open';
    const hasComparableHandicap = typeof profile?.handicap === 'number' && profile.handicap >= 0 && profile.handicap <= 36;
    const matchesHandicap = !hasComparableHandicap || isHandicapInRange(profile.handicap, round.min_handicap, round.max_handicap);

    return matchesSearch && matchesFilter && matchesHandicap;
  });

  return (
    <div className="screen-content">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-golf p-6 pb-7 mb-6">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-primary-foreground/5" />
        
        <div className="relative z-10">
          <p className="text-primary-foreground/70 text-sm font-medium mb-1">{t('home.subtitle')}</p>
          <h1 className="text-2xl font-bold text-primary-foreground font-serif mb-4">{t('home.title')}</h1>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm rounded-full px-4 py-2">
              <Circle size={8} className="fill-primary-foreground/80 text-primary-foreground/80 animate-pulse-soft" />
              <span className="text-primary-foreground text-sm font-semibold">
                {openCount} {t('home.openRounds')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="golf-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowOpenOnly(!showOpenOnly)}
          className={`p-3 rounded-xl border transition-all duration-200 ${
            showOpenOnly 
              ? 'bg-primary text-primary-foreground border-primary shadow-golf' 
              : 'bg-card text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header mb-0">{t('home.upcomingRounds')}</h2>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {filteredRounds.length}
        </span>
      </div>

      {/* Rounds List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredRounds.length > 0 ? (
          filteredRounds.map((round, i) => (
            <div key={round.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
              <RoundCard round={round} />
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold">{t('home.noRoundsFound')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('home.noRoundsHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
