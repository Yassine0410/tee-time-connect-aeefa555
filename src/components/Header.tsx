import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: ReactNode;
  className?: string;
}

export function Header({ title, subtitle, showBack = false, action, className }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={cn('flex items-center gap-3 mb-6', className)}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-foreground font-serif">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
