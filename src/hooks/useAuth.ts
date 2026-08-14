import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../data/socialData';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    // Check initial local session if mock, or Supabase session if configured
    const storedMockUser = localStorage.getItem('eclesia_mock_user');
    
    if (storedMockUser) {
      try {
        const parsed = JSON.parse(storedMockUser);
        setProfile(parsed);
        setIsMock(true);
        setUser({ id: parsed.id, email: parsed.email || 'escritor@eclesia.org' } as User);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('eclesia_mock_user');
      }
    }

    if (isSupabaseConfigured) {
      // Fetch initial Supabase user
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        if (user) {
          setProfile(buildProfileFromSupabaseUser(user));
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          setProfile(buildProfileFromSupabaseUser(currentUser));
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const buildProfileFromSupabaseUser = (u: User): UserProfile => {
    const meta = u.user_metadata || {};
    // Strict Admin check: only allow master email or verified admin profile
    const isAdmin = u.email === 'suporte.delski@gmail.com';
    return {
      id: u.id,
      name: meta.name || u.email?.split('@')[0] || 'Escritor Cristão',
      handle: meta.handle || `@${(meta.name || u.email?.split('@')[0] || 'escritor').toLowerCase().replace(/\s+/g, '_')}`,
      avatar: meta.avatar || CURRENT_USER.avatar,
      bio: meta.bio || 'Escritor e compartilhador de ideias e sentimentos cristãos na Eclesia.',
      role: isAdmin ? 'admin' : 'user',
      email: u.email,
      is_minor: false,
      age: meta.age || 25,
      profile_visibility: 'publico',
      dm_policy: 'todos',
      parish_name: meta.parish_name || 'Paróquia Central',
      patron_saint: meta.patron_saint || 'Nossa Senhora Aparecida',
      joined_date: 'Agosto de 2026'
    };
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!profile) return { success: false, message: 'Nenhum usuário conectado.' };

    const newProfile: UserProfile = {
      ...profile,
      ...updatedData
    };

    setProfile(newProfile);

    // Save in localStorage if mock or offline
    const storedMockUser = localStorage.getItem('eclesia_mock_user');
    if (storedMockUser) {
      try {
        const parsed = JSON.parse(storedMockUser);
        localStorage.setItem('eclesia_mock_user', JSON.stringify({ ...parsed, ...newProfile }));
      } catch (e) {
        localStorage.setItem('eclesia_mock_user', JSON.stringify(newProfile));
      }
    }

    // Save in Supabase if configured
    if (isSupabaseConfigured && user) {
      try {
        await supabase.auth.updateUser({
          data: {
            name: newProfile.name,
            handle: newProfile.handle,
            avatar: newProfile.avatar,
            bio: newProfile.bio,
            parish_name: newProfile.parish_name,
            patron_saint: newProfile.patron_saint,
          }
        });
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: newProfile.name,
          avatar_url: newProfile.avatar,
        });
      } catch (err) {
        console.error('Erro ao salvar no Supabase:', err);
      }
    }

    return { success: true, message: 'Perfil atualizado com sucesso!' };
  };

  const signUp = async (email: string, password: string, name: string, bio?: string) => {
    setLoading(true);
    const isAdmin = email === 'suporte.delski@gmail.com';
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              bio: bio || 'Escritor e compartilhador de ideias e sentimentos cristãos na Eclesia.',
              role: isAdmin ? 'admin' : 'user'
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          const prof = buildProfileFromSupabaseUser(data.user);
          setProfile(prof);
          setUser(data.user);
        }
        setLoading(false);
        return { success: true, message: 'Conta criada com sucesso!' };
      } else {
        // Fallback for development without live Supabase credentials
        const mockProf: UserProfile = {
          id: `usr-created-${Date.now()}`,
          name: name || 'Escritor Cristão',
          handle: `@${name.toLowerCase().replace(/\s+/g, '_') || 'escritor_cristao'}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          bio: bio || 'Escritor e compartilhador de ideias e sentimentos cristãos na Eclesia.',
          role: isAdmin ? 'admin' : 'user',
          email,
          is_minor: false,
          age: 25,
          profile_visibility: 'publico',
          dm_policy: 'todos',
          joined_date: 'Agosto de 2026'
        };
        localStorage.setItem('eclesia_mock_user', JSON.stringify({ ...mockProf, email }));
        setProfile(mockProf);
        setUser({ id: mockProf.id, email } as User);
        setIsMock(true);
        setLoading(false);
        return { success: true, message: 'Conta criada com sucesso na Eclesia!' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Erro ao criar conta.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const isAdmin = email === 'suporte.delski@gmail.com';
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          setProfile(buildProfileFromSupabaseUser(data.user));
        }
        setLoading(false);
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        // Fallback login
        const nameFromEmail = email.split('@')[0];
        const mockProf: UserProfile = {
          id: `usr-${Date.now()}`,
          name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
          handle: `@${nameFromEmail.toLowerCase()}`,
          avatar: CURRENT_USER.avatar,
          bio: 'Escritor e compartilhador de ideias e sentimentos cristãos na Eclesia.',
          role: isAdmin ? 'admin' : 'user',
          email,
          is_minor: false,
          age: 28,
          profile_visibility: 'publico',
          dm_policy: 'todos',
          joined_date: 'Agosto de 2026'
        };
        localStorage.setItem('eclesia_mock_user', JSON.stringify({ ...mockProf, email }));
        setProfile(mockProf);
        setUser({ id: mockProf.id, email } as User);
        setIsMock(true);
        setLoading(false);
        return { success: true, message: 'Login efetuado com sucesso na Eclesia!' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Erro ao fazer login.' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('eclesia_mock_user');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsMock(false);
    setLoading(false);
  };

  return {
    user,
    profile,
    loading,
    isMock,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
}

