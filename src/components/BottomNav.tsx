import { useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, User, Calendar, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/rounds', icon: Calendar, label: t('nav.rounds') },
    { path: '/create', icon: PlusCircle, label: t('nav.create') },
    { path: '/messages', icon: MessageCircle, label: t('nav.chat') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  // Hide bottom nav on chat detail pages
  if (location.pathname.startsWith('/chat/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="bg-card/95 backdrop-blur-lg border-t border-border px-2 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className={cn(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
