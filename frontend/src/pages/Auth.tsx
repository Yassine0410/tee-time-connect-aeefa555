import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Flag, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.signupSuccessTitle'), description: t('auth.signupSuccessDesc') });
      setMode('login');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.emailSentTitle'), description: t('auth.emailSentDesc') });
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
          <LanguageToggle compact />
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-golf flex items-center justify-center mb-3">
            <Flag size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">GolfConnect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' && t('auth.loginTagline')}
            {mode === 'signup' && t('auth.signupTagline')}
            {mode === 'forgot' && t('auth.forgotTagline')}
          </p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-golf" disabled={loading}>
              {loading ? t('auth.loginLoading') : t('auth.login')}
            </Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setMode('forgot')} className="text-primary hover:underline">
                {t('auth.forgotPassword')}
              </button>
              <button type="button" onClick={() => setMode('signup')} className="text-primary hover:underline">
                {t('auth.createAccount')}
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="name" placeholder={t('auth.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-signup">{t('auth.email')}</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="email-signup" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">{t('auth.password')}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="password-signup"
                  type="password"
                  placeholder={t('auth.passwordMin')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  minLength={6}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-golf" disabled={loading}>
              {loading ? t('auth.signupLoading') : t('auth.signup')}
            </Button>
            <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft size={14} /> {t('auth.backToLogin')}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-reset">{t('auth.email')}</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="email-reset" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-golf" disabled={loading}>
              {loading ? t('auth.sendLinkLoading') : t('auth.sendLink')}
            </Button>
            <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft size={14} /> {t('auth.backToLogin')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
