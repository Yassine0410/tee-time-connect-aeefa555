import { Settings, Trophy, Calendar, TrendingUp, ChevronRight, BarChart3, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useProfile, useMyRounds } from '@/hooks/useGolfData';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (isLoading || !profile) {
    return (
      <div className="screen-content">
        <Header title="Profile" />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Calendar, label: 'Handicap', value: profile.handicap },
    { icon: Trophy, label: 'Club', value: profile.home_club || '—' },
    { icon: TrendingUp, label: 'Member since', value: new Date(profile.created_at).getFullYear() },
  ];

  const menuItems = [
    { label: 'Modifier le profil', path: '/profile/edit', icon: Settings },
    { label: 'Classement', path: '/leaderboard', icon: Trophy },
    { label: 'Mes rondes', path: '/rounds', icon: Calendar },
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
            name={profile.name || 'User'} 
            avatarUrl={profile.avatar_url || undefined}
            size="xl" 
            showRing 
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{profile.name || 'New Golfer'}</h2>
            <p className="text-muted-foreground text-sm">{profile.home_club || 'No home club set'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="golf-badge-primary font-bold">HCP {profile.handicap}</span>
              <span className="text-xs text-muted-foreground">
                Member since {new Date(profile.created_at).getFullYear()}
              </span>
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="text-sm text-muted-foreground border-t border-border pt-4">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Menu Items */}
      <div className="golf-card p-0 overflow-hidden animate-fade-in">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <Icon size={18} className="text-muted-foreground" />
              <span className="font-medium text-foreground flex-1">{item.label}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Sign Out */}
      <button 
        onClick={signOut}
        className="w-full mt-6 py-3 text-center text-destructive font-medium hover:bg-destructive/10 rounded-xl transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
