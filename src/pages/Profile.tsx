import { Settings, Trophy, Calendar, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useProfile } from '@/hooks/useGolfData';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useProfileReputation } from '@/hooks/useReputation';

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: reputation, isLoading: reputationLoading } = useProfileReputation(profile?.id);

  if (isLoading || !profile) {
    return (
      <div className="screen-content">
        <Header title={t('profile.title')} />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: t('profile.editProfile'), path: '/profile/edit', icon: Settings },
    { label: t('profile.leaderboard'), path: '/leaderboard', icon: Trophy },
    { label: t('profile.myRounds'), path: '/rounds', icon: Calendar },
    { label: t('profile.reviews'), path: '/reviews', icon: Star },
  ];

  const roundsPlayed = reputation?.roundsPlayed ?? 0;
  const reliabilityValue =
    reputation?.reliabilityPercent !== null && reputation?.reliabilityPercent !== undefined
      ? `${reputation.reliabilityPercent}%`
      : "--";
  const ratingValue =
    reputation?.averageRating !== null && reputation?.averageRating !== undefined
      ? `${reputation.averageRating.toFixed(1)} ★`
      : t('profile.kpi.noRating');

  return (
    <div className="screen-content">
      <Header title={t('profile.title')} action={<LanguageToggle compact />} />

      <div className="golf-card mb-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <PlayerAvatar
            name={profile.name || t('common.user')}
            avatarUrl={profile.avatar_url || undefined}
            size="xl"
            showRing
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{profile.name || t('profile.newGolfer')}</h2>
            <p className="text-muted-foreground text-sm">{profile.home_club || t('profile.noHomeClub')}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="golf-badge-primary font-bold">HCP {profile.handicap}</span>
              <span className="text-xs text-muted-foreground">
                {t('common.memberSince', { year: new Date(profile.created_at).getFullYear() })}
              </span>
            </div>
          </div>
        </div>
        {profile.bio && <p className="text-sm text-muted-foreground border-t border-border pt-4">{profile.bio}</p>}

        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">{t('profile.kpi.roundsPlayed')}</p>
              <p className="text-lg font-bold text-foreground">{reputationLoading ? "..." : roundsPlayed}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">{t('profile.kpi.reliability')}</p>
              <p className="text-lg font-bold text-foreground">{reputationLoading ? "..." : reliabilityValue}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground">{t('profile.kpi.rating')}</p>
              <p className="text-lg font-bold text-foreground">{reputationLoading ? "..." : ratingValue}</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {reputationLoading
              ? t('profile.kpi.loadingMeta')
              : reputation && reputation.reliabilitySampleSize > 0
              ? t('profile.kpi.meta', {
                  count: reputation.reviewsCount,
                  sample: reputation.reliabilitySampleSize,
                })
              : t('profile.kpi.metaNoAttendance', { count: reputation?.reviewsCount ?? 0 })}
          </p>
        </div>
      </div>

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

      <div className="mt-6 golf-card">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t('language.label')}</span>
          <LanguageToggle compact />
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full mt-6 py-3 text-center text-destructive font-medium hover:bg-destructive/10 rounded-xl transition-colors"
      >
        {t('profile.signOut')}
      </button>
    </div>
  );
}
