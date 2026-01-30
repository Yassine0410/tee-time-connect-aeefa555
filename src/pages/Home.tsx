import { useState } from 'react';
import { Search, Filter, Bell } from 'lucide-react';
import { RoundCard } from '@/components/RoundCard';
import { Header } from '@/components/Header';
import { mockRounds } from '@/data/mockData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const filteredRounds = mockRounds.filter((round) => {
    const matchesSearch = 
      round.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      round.courseLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      round.format.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !showOpenOnly || round.status === 'open';
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="screen-content">
      {/* Header */}
      <Header 
        title="Find Your Round"
        subtitle="Connect with golfers near you"
        action={
          <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </button>
        }
      />

      {/* Search & Filter */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses, formats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="golf-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowOpenOnly(!showOpenOnly)}
          className={`p-3 rounded-xl border transition-all duration-200 ${
            showOpenOnly 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-card text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex-shrink-0 bg-gradient-golf text-primary-foreground rounded-2xl p-4 min-w-[140px]">
          <p className="text-3xl font-bold">{mockRounds.filter(r => r.status === 'open').length}</p>
          <p className="text-sm opacity-90">Open Rounds</p>
        </div>
        <div className="flex-shrink-0 golf-card min-w-[140px]">
          <p className="text-3xl font-bold text-foreground">{mockRounds.length}</p>
          <p className="text-sm text-muted-foreground">This Week</p>
        </div>
        <div className="flex-shrink-0 golf-card min-w-[140px]">
          <p className="text-3xl font-bold text-foreground">47</p>
          <p className="text-sm text-muted-foreground">Active Golfers</p>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header mb-0">Upcoming Rounds</h2>
        <button className="text-sm font-medium text-primary">See all</button>
      </div>

      {/* Rounds List */}
      <div className="space-y-4">
        {filteredRounds.length > 0 ? (
          filteredRounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No rounds found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
