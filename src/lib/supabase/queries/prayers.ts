import { supabase } from '../client';

export interface DBPrayer {
  id: string;
  title: string;
  slug: string;
  situation: string;
  content: string;
  is_featured_today: boolean;
  featured_date: string | null;
  created_at: string;
}

export async function getFeaturedPrayer(): Promise<DBPrayer | null> {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('is_featured_today', true)
    .limit(1)
    .single();

  if (error) {
    console.error('[prayers] getFeaturedPrayer error:', error);
    return null;
  }
  return data;
}

export async function getPrayersBySituation(situation?: string): Promise<DBPrayer[]> {
  let query = supabase
    .from('prayers')
    .select('*')
    .order('created_at', { ascending: false });

  if (situation && situation !== 'all') {
    query = query.eq('situation', situation);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[prayers] getPrayersBySituation error:', error);
    return [];
  }
  return data ?? [];
}

export async function getPrayerBySlug(slug: string): Promise<DBPrayer | null> {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('[prayers] getPrayerBySlug error:', error);
    return null;
  }
  return data;
}
