import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../data/socialData';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Busca e sincroniza o perfil do usuário diretamente da tabela "profiles" do Supabase
  const fetchProfileFromSupabase = useCallback(async (u: User): Promise<UserProfile> => {
    const meta = u.user_metadata || {};
    const isAdminEmail = u.email === 'suporte.delski@gmail.com';

    let dbRole: 'admin' | 'editor' | 'assinante' | 'user' | null = null;
    let fullNameFromDb: string | null = null;
    let avatarFromDb: string | null = null;
    let createdAtFromDb: string | null = null;

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url, created_at')
          .eq('id', u.id)
          .maybeSingle();

        if (!error && data) {
          dbRole = (data.role as any) || null;
          fullNameFromDb = data.full_name || null;
          avatarFromDb = data.avatar_url || null;
          createdAtFromDb = data.created_at || null;
        } else if (error) {
          console.warn('[useAuth] Aviso ao consultar tabela profiles:', error.message);
        }
      }
    } catch (e) {
      console.warn('[useAuth] Exceção ao consultar tabela profiles:', e);
    }

    // Role definitiva: do banco de dados profiles, ou fallback para admin se for o email mestre
    const role: 'admin' | 'editor' | 'assinante' | 'user' =
      dbRole || (isAdminEmail ? 'admin' : ((meta.role as any) || 'user'));

    const name = fullNameFromDb || meta.full_name || meta.name || u.email?.split('@')[0] || 'Usuário Eclesia';

    const userProfile: UserProfile = {
      id: u.id,
      name,
      handle: meta.handle || `@${(name || 'usuario').toLowerCase().replace(/\s+/g, '_')}`,
      avatar: avatarFromDb || meta.avatar || CURRENT_USER.avatar,
      bio: meta.bio || 'Membro da comunidade e leitor Eclesia.',
      role,
      email: u.email,
      is_minor: false,
      age: meta.age || 28,
      profile_visibility: 'publico',
      dm_policy: 'todos',
      parish_name: meta.parish_name || 'Paróquia Central',
      patron_saint: meta.patron_saint || 'Nossa Senhora Aparecida',
      joined_date: createdAtFromDb
        ? new Date(createdAtFromDb).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        : 'Agosto de 2026'
    };

    return userProfile;
  }, []);

  // Inicialização e monitoramento do estado de autenticação Supabase
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          // 1. Obtém a sessão atual salva em storage pelo client
          const { data: { session: currentSession }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) throw sessionErr;

          if (currentSession?.user && isMounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            const prof = await fetchProfileFromSupabase(currentSession.user);
            if (isMounted) setProfile(prof);
          }
        }
      } catch (err) {
        console.error('[useAuth] Erro ao carregar sessão inicial do Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // 2. Escuta alterações em tempo real no Supabase Auth (login, logout, token refresh)
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;

        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const prof = await fetchProfileFromSupabase(currentUser);
          if (isMounted) setProfile(prof);
        } else {
          if (isMounted) setProfile(null);
        }
        if (isMounted) setLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [fetchProfileFromSupabase]);

  // Atualizar perfil
  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user || !profile) return { success: false, message: 'Nenhum usuário conectado.' };

    const newProfile: UserProfile = {
      ...profile,
      ...updatedData
    };

    setProfile(newProfile);

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({
          data: {
            name: newProfile.name,
            full_name: newProfile.name,
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
        console.error('[useAuth] Erro ao salvar no Supabase:', err);
      }
    }

    return { success: true, message: 'Perfil atualizado com sucesso!' };
  };

  // Login real com Supabase Auth
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return { success: false, message: 'Supabase não está configurado. Verifique as credenciais.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Email ainda não confirmado. Verifique a caixa de entrada do seu email.';
        } else if (msg.includes('rate limit')) {
          msg = 'Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.';
        }
        setLoading(false);
        return { success: false, message: msg };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        const prof = await fetchProfileFromSupabase(data.user);
        setProfile(prof);
        setLoading(false);
        return {
          success: true,
          message: 'Login realizado com sucesso!',
          role: prof.role,
          user: data.user,
          profile: prof
        };
      }

      setLoading(false);
      return { success: false, message: 'Não foi possível autenticar o usuário.' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err?.message || 'Erro inesperado ao realizar login.' };
    }
  };

  // Cadastro de novo usuário
  const signUp = async (email: string, password: string, name: string, bio?: string) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return { success: false, message: 'Supabase não está configurado.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
            name,
            bio: bio || 'Membro da comunidade e leitor Eclesia.'
          }
        }
      });

      if (error) {
        setLoading(false);
        return { success: false, message: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        const prof = await fetchProfileFromSupabase(data.user);
        setProfile(prof);
      }

      setLoading(false);
      return {
        success: true,
        message: 'Conta criada com sucesso! Se necessário, confirme seu email pela caixa de entrada.'
      };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err?.message || 'Erro ao criar conta.' };
    }
  };

  // Redefinição de senha
  const resetPassword = async (email: string) => {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, message: 'Supabase não está configurado.' };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin`
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return {
        success: true,
        message: 'Link de redefinição enviado com sucesso! Verifique a caixa de entrada do seu email.'
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao enviar email de recuperação.' };
    }
  };

  // Logout real no Supabase Auth
  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('[useAuth] Erro ao deslogar:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile: fetchProfileFromSupabase
  };
}
