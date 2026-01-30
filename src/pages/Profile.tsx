import { Settings, Trophy, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { currentPlayer } from '@/data/mockData';

export default function Profile() {
  const stats = [
    { icon: Calendar, label: 'Rounds Played', value: currentPlayer.roundsPlayed },
    { icon: Trophy, label: 'Best Score', value: '78' },
    { icon: TrendingUp, label: 'Avg Score', value: '86' },
  ];

  const menuItems = [
    { label: 'Edit Profile', path: '/profile/edit' },
    { label: 'My Statistics', path: '/profile/stats' },
    { label: 'Handicap History', path: '/profile/handicap' },
    { label: 'Notifications', path: '/profile/notifications' },
    { label: 'Settings', path: '/profile/settings' },
    { label: 'Help & Support', path: '/help' },
  ];

  return (
    <div className="screen-content">
      <Header 
        title="Profile"
        action={
          <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings size={22} />
          </button>
        }
      />

      {/* Profile Card */}
      <div className="golf-card mb-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <PlayerAvatar 
            name={currentPlayer.name} 
            size="xl" 
            showRing 
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{currentPlayer.name}</h2>
            <p className="text-muted-foreground text-sm">{currentPlayer.homeClub}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="golf-badge-primary font-bold">
                HCP {currentPlayer.handicap}
              </span>
              <span className="text-xs text-muted-foreground">
                Member since {new Date(currentPlayer.joinedDate).getFullYear()}
              </span>
            </div>
          </div>
        </div>
        {currentPlayer.bio && (
          <p className="text-sm text-muted-foreground border-t border-border pt-4">
            {currentPlayer.bio}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="golf-card text-center animate-fade-in"
          >
            <stat.icon size={20} className="mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Handicap Trend Card */}
      <div className="golf-card mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Handicap Trend</h3>
          <span className="text-xs text-muted-foreground">Last 6 months</span>
        </div>
        <div className="flex items-end gap-2 h-16 mb-2">
          {[18, 17, 16, 15, 14, 14].map((hcp, i) => (
            <div 
              key={i}
              className="flex-1 bg-gradient-golf rounded-t-sm transition-all duration-300"
              style={{ height: `${(20 - hcp) * 6 + 20}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Aug</span>
          <span>Jan</span>
        </div>
        <p className="text-center text-sm text-primary font-medium mt-3">
          📉 Down 4 strokes! Keep it up!
        </p>
      </div>

      {/* Menu Items */}
      <div className="golf-card p-0 overflow-hidden animate-fade-in">
        {menuItems.map((item, index) => (
          <button
            key={item.path}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors ${
              index !== menuItems.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="font-medium text-foreground">{item.label}</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <button className="w-full mt-6 py-3 text-center text-destructive font-medium hover:bg-destructive/10 rounded-xl transition-colors">
        Sign Out
      </button>
    </div>
  );
}
