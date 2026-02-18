import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Flag, Mail, Lock, User, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Inscription réussie !',
        description: 'Vérifie ton email pour confirmer ton compte.',
      });
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
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email envoyé', description: 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.' });
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-golf flex items-center justify-center mb-3">
            <Flag size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">GolfConnect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' && 'Connecte-toi pour rejoindre tes parties'}
            {mode === 'signup' && 'Crée ton compte golfeur'}
            {mode === 'forgot' && 'Réinitialise ton mot de passe'}
          </p>
        </div>

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="email" type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-golf" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setMode('forgot')} className="text-primary hover:underline">Mot de passe oublié ?</button>
              <button type="button" onClick={() => setMode('signup')} className="text-primary hover:underline">Créer un compte</button>
            </div>
          </form>
        )}

        {/* Signup form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="name" placeholder="Ton nom" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-signup">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="email-signup" type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">Mot de passe</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="password-signup" type="password" placeholder="Min. 6 caractères" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" minLength={6} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-golf" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </Button>
            <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft size={14} /> Retour à la connexion
            </button>
          </form>
        )}

        {/* Forgot password form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-reset">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input id="email-reset" type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-golf" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>
            <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft size={14} /> Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
