import { supabaseServer } from '../server'

// ================================================================
// Tipos alinhados com o schema_v1.sql
// ================================================================
export interface DBSaint {
  id: string
  name: string
  slug: string
  title: string | null
  feast_month: number
  feast_day: number
  short_bio: string
  full_bio: string | null
  patronage: string | null
  category: string | null
  image_url: string | null
  prayer: string | null
  quotes: string[] | null
  featured: boolean
  created_at: string
}

// ================================================================
// Queries
// ================================================================

/** Busca o santo do dia atual */
export async function getSaintOfTheDay(): Promise<DBSaint | null> {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  const { data, error } = await supabaseServer
    .from('saints')
    .select('*')
    .eq('feast_month', month)
    .eq('feast_day', day)
    .order('featured', { ascending: false }) // featured = solenidade/prioridade maior
    .limit(1)
    .single()

  if (error) {
    console.error('[saints] getSaintOfTheDay error:', error)
    return null
  }
  return data
}

/** Busca todos os santos de um mês */
export async function getSaintsByMonth(month: number): Promise<DBSaint[]> {
  const { data, error } = await supabaseServer
    .from('saints')
    .select('*')
    .eq('feast_month', month)
    .order('feast_day', { ascending: true })

  if (error) {
    console.error('[saints] getSaintsByMonth error:', error)
    return []
  }
  return (data as DBSaint[]) ?? []
}

/** Busca santo por slug (página individual) */
export async function getSaintBySlug(slug: string): Promise<DBSaint | null> {
  const { data, error } = await supabaseServer
    .from('saints')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('[saints] getSaintBySlug error:', error)
    return null
  }
  return data as DBSaint
}

/** Busca todos os slugs (para generateStaticParams do Next.js) */
export async function getAllSaintSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabaseServer
    .from('saints')
    .select('slug')

  if (error) {
    console.error('[saints] getAllSaintSlugs error:', error)
    return []
  }
  return data ?? []
}

/** Busca santos em destaque para a Home */
export async function getFeaturedSaints(limit = 3): Promise<DBSaint[]> {
  const { data, error } = await supabaseServer
    .from('saints')
    .select('*')
    .eq('featured', true)
    .limit(limit)

  if (error) {
    console.error('[saints] getFeaturedSaints error:', error)
    return []
  }
  return (data as DBSaint[]) ?? []
}

/** Busca por nome (para SearchModal) */
export async function searchSaints(query: string): Promise<DBSaint[]> {
  const { data, error } = await supabaseServer
    .from('saints')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('[saints] searchSaints error:', error)
    return []
  }
  return (data as DBSaint[]) ?? []
}
