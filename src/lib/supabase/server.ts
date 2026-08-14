import { createClient } from '@supabase/supabase-js';

// Server Component client — usa service role key para operações de admin / SSR seguro
// NUNCA expor SUPABASE_SERVICE_ROLE_KEY no browser
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
