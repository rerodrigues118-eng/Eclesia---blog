import { createClient } from '@supabase/supabase-js'

// Server Component client — usa service role key para operações de admin
// NUNCA expor SUPABASE_SERVICE_ROLE_KEY no browser
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
