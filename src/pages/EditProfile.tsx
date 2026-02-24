import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { Header } from '@/components/Header';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { useProfile, useUpdateProfile } from '@/hooks/useGolfData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [handicap, setHandicap] = useState('');
  const [homeClub, setHomeClub] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form values once profile is loaded
  if (profile && !initialized) {
    setName(profile.name || '');
    setHandicap(String(profile.handicap ?? 36));
    setHomeClub(profile.home_club || '');
    setBio(profile.bio || '');
    setAvatarUrl(profile.avatar_url);
    setInitialized(true);
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      setAvatarUrl(publicUrl);
      toast({ title: 'Photo mise à jour !' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const hcpNum = parseInt(handicap, 10);
    if (isNaN(hcpNum) || hcpNum < -10 || hcpNum > 54) {
      toast({ title: 'Handicap invalide', description: 'Entre -10 et 54', variant: 'destructive' });
      return;
    }
    if (!name.trim()) {
      toast({ title: 'Nom requis', variant: 'destructive' });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        handicap: hcpNum,
        home_club: homeClub.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      });
      toast({ title: 'Profil sauvegardé !' });
      navigate('/profile');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="screen-content">
        <Header title="Modifier le profil" />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="screen-content">
      <Header
        title="Modifier le profil"
        action={
          <button onClick={() => navigate('/profile')} className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft size={22} />
          </button>
        }
      />

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="relative">
          <PlayerAvatar
            name={name || 'User'}
            avatarUrl={avatarUrl || undefined}
            size="xl"
            showRing
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={16} />
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <p className="text-sm text-muted-foreground mt-2">Appuie pour changer ta photo</p>
      </div>

      {/* Form */}
      <div className="space-y-5 animate-fade-in">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Nom</label>
          <input
            className="golf-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton nom"
            maxLength={100}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Handicap</label>
          <input
            className="golf-input"
            type="number"
            value={handicap}
            onChange={(e) => setHandicap(e.target.value)}
            min={-10}
            max={54}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Club</label>
          <input
            className="golf-input"
            value={homeClub}
            onChange={(e) => setHomeClub(e.target.value)}
            placeholder="Ton club de golf"
            maxLength={100}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
          <textarea
            className="golf-input min-h-[100px] resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Quelques mots sur toi..."
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/500</p>
        </div>
      </div>

      {/* Save */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="w-full btn-golf-primary disabled:opacity-50"
        >
          {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-full py-3 text-center text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
