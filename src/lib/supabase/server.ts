/**
 * Módulo de cliente Supabase.
 * NOTA DE SEGURANÇA: Operações que necessitam de Service Role Key NUNCA devem
 * ser executadas no bundle de frontend do navegador (src/). Operações privilegiadas
 * devem ser executadas exclusivamente via Edge Functions do Supabase.
 */
import { supabase } from './client';

// Re-exporta a instância segura autenticada do cliente
export const supabaseServer = supabase;
export default supabase;
