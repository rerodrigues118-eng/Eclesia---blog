import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  const meta = import.meta as any;
  if (meta && meta.env && meta.env[key]) {
    return meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Configuração padrão com o projeto Eclesia Supabase
const DEFAULT_SUPABASE_URL = 'https://sdyytxnmdquriqsxuvhd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_iBExFVNbs14S0ty_M0pLLw_LubqbWxo';

export const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-key'
);

// Client único e centralizado para toda a aplicação (público e admin com suporte a sessão persistente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
  }
});
