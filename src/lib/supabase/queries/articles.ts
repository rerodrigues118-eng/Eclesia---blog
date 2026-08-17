import { supabase } from '../client';

export interface DBArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  type: 'artigo' | 'noticia';
  author_id: string | null;
  status: 'rascunho' | 'agendado' | 'publicado';
  source: 'manual' | 'n8n_ia';
  featured: boolean;
  trending: boolean;
  published_at: string | null;
  created_at: string;
}

export async function getPublishedArticles(category?: string, limit = 20): Promise<DBArticle[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'publicado')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category && category !== 'all') {
    query = query.ilike('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[articles] getPublishedArticles error:', error);
    return [];
  }
  return data ?? [];
}

export async function getFeaturedArticle(): Promise<DBArticle | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'publicado')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('[articles] getFeaturedArticle error:', error);
    return null;
  }
  return data;
}

export async function getArticleBySlug(slug: string): Promise<DBArticle | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publicado')
    .single();

  if (error) {
    console.error('[articles] getArticleBySlug error:', error);
    return null;
  }
  return data;
}

export async function getAllArticleSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'publicado');

  if (error) {
    console.error('[articles] getAllArticleSlugs error:', error);
    return [];
  }
  return data ?? [];
}
