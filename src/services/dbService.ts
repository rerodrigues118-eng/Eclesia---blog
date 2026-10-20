import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Essay, Product, PrayerItem, Saint } from '../types';
import { notifyNewContentPublished } from './seoIndexing';
import { obterSantoDoCalendario } from '../data/romanMartyrology';

const STORAGE_KEY_ARTICLES = 'eclesia_db_articles';
const STORAGE_KEY_PRODUCTS = 'eclesia_db_products';
const STORAGE_KEY_PRAYERS = 'eclesia_db_prayers';
const STORAGE_KEY_SAINTS = 'eclesia_db_saints';

// =========================================================================
// 1. ARTICLES / BLOG DATABASE SERVICE (100% DINÂMICO SUPABASE)
// =========================================================================

export async function fetchArticlesFromDb(): Promise<Essay[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[dbService] Erro ao buscar artigos do Supabase:', error);
      } else if (data) {
        const mapped: Essay[] = data.map((item: any) => ({
          id: item.id,
          title: item.title || '',
          category: item.category || 'Teologia',
          type: item.type || 'artigo',
          imageUrl: item.cover_image || 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
          excerpt: item.excerpt || '',
          content: item.content || '',
          author: item.author_name || 'Redação Eclesia',
          readTime: item.read_time || '5 min de leitura',
          date: item.published_at
            ? new Date(item.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
            : 'Recente',
          featured: Boolean(item.featured),
          trending: Boolean(item.trending),
          slug: item.slug,
          metaTitle: item.meta_title || item.title,
          metaDescription: item.meta_description || item.excerpt,
          keywords: item.keywords || [],
          mediaMap: item.media_map
        }));

        try {
          localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(mapped));
        } catch (e) {
          console.warn('[dbService] Falha ao atualizar cache local:', e);
        }
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase articles fetch exception:', err);
  }

  // Fallback para cache local apenas em caso de falha de conexão ou offline
  const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }
  return [];
}

export async function saveArticleToDb(article: Essay): Promise<{ success: boolean; article: Essay }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não está configurado. Verifique as credenciais no .env');
  }

  // Verifica se a sessão do Supabase está ativa para garantir autorização
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.warn('[dbService] Atenção: Nenhuma sessão ativa detectada. A operação depende de políticas permissivas ou do email de admin.');
  }

  // Garante um UUID válido v4 para o banco de dados
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(article.id);
  const finalId = isUuid 
    ? article.id 
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

  const cleanSlug = (article.slug || article.title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `artigo-${Date.now()}`;

  const payload: any = {
    title: article.title.trim(),
    slug: cleanSlug,
    excerpt: article.excerpt?.trim() || '',
    content: article.content?.trim() || '',
    cover_image: article.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
    category: article.category || 'Teologia',
    type: article.type || 'artigo',
    author_name: article.author || 'Redação Eclesia',
    read_time: article.readTime || '5 min de leitura',
    featured: Boolean(article.featured),
    trending: Boolean(article.trending),
    meta_title: article.metaTitle || article.title,
    meta_description: article.metaDescription || article.excerpt,
    keywords: Array.isArray(article.keywords) ? article.keywords : [],
    media_map: article.mediaMap || null,
    source: 'manual',
    status: 'publicado',
    published_at: new Date().toISOString()
  };

  if (finalId) {
    payload.id = finalId;
  }

  let res;
  if (finalId) {
    res = await supabase.from('articles').upsert(payload, { onConflict: 'id' }).select();
  } else {
    res = await supabase.from('articles').upsert(payload, { onConflict: 'slug' }).select();
  }

  const { data, error } = res;

  if (error) {
    console.error('[dbService] Erro crítico ao salvar artigo no Supabase:', error);
    throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message} ${error.details || ''} ${error.hint || ''}`.trim());
  }

  const savedArticle: Essay = {
    ...article,
    id: (data && data[0] && data[0].id) ? data[0].id : (finalId || article.id),
    slug: (data && data[0] && data[0].slug) ? data[0].slug : cleanSlug
  };

  // Atualiza o cache local apenas após confirmação real do Supabase
  try {
    const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
    let current: Essay[] = [];
    if (local) {
      try { current = JSON.parse(local); } catch { current = []; }
    }
    const exists = current.some(a => a.id === savedArticle.id || a.slug === savedArticle.slug);
    const updatedList = exists
      ? current.map(a => (a.id === savedArticle.id || a.slug === savedArticle.slug) ? savedArticle : a)
      : [savedArticle, ...current];
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('[dbService] Aviso ao sincronizar cache local após salvamento:', e);
  }

  // Notifica Google e Bing via IndexNow em background sem travar o salvamento
  try {
    if (savedArticle.slug) {
      notifyNewContentPublished(savedArticle.slug, 'blog').catch(err => {
        console.warn('[dbService] Erro não bloqueante ao notificar buscadores:', err);
      });
    }
  } catch {}

  return { success: true, article: savedArticle };
}

export async function deleteArticleFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
  if (local) {
    try {
      const current: Essay[] = JSON.parse(local);
      const filtered = current.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(filtered));
    } catch {}
  }

  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = isUuid
      ? supabase.from('articles').delete().eq('id', id)
      : supabase.from('articles').delete().eq('slug', id);

    const { error } = await query;
    if (error) {
      console.error('[dbService] Erro ao deletar artigo do Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }
  }

  return true;
}

// =========================================================================
// 2. PRODUCTS / STORE DATABASE SERVICE (100% DINÂMICO SUPABASE)
// =========================================================================

export async function fetchProductsFromDb(): Promise<Product[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[dbService] Erro ao buscar produtos do Supabase:', error);
      }

      if (!error && data) {
        const mapped: Product[] = data.map((item: any) => ({
          id: item.id,
          title: item.name || '',
          subtitle: item.subtitle || '',
          price: (item.price_cents || 0) / 100,
          category: item.category || 'livro',
          imageUrl: (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          description: item.description || '',
          inStock: (item.stock || 0) > 0,
          buyUrl: item.buy_url || ''
        }));

        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase products fetch warning:', err);
  }

  const local = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }
  return [];
}

export async function saveProductToDb(product: Product): Promise<{ success: boolean; product: Product }> {
  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
    
    // Normaliza categoria para enum do banco: 'livro' | 'sacramental' | 'arte' | 'vestuario'
    let normCat: 'livro' | 'sacramental' | 'arte' | 'vestuario' = 'livro';
    const c = (product.category || '').toLowerCase();
    if (c.includes('sacrament')) normCat = 'sacramental';
    else if (c.includes('arte')) normCat = 'arte';
    else if (c.includes('vestu')) normCat = 'vestuario';
    else normCat = 'livro';

    const payload: any = {
      name: product.title,
      slug: product.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      subtitle: product.subtitle || '',
      description: product.description || '',
      price_cents: Math.round((product.price || 0) * 100),
      images: product.imageUrl ? [product.imageUrl] : [],
      stock: product.inStock ? 50 : 0,
      category: normCat,
      active: true,
      buy_url: product.buyUrl || ''
    };

    let res;
    if (isUuid) {
      payload.id = product.id;
      res = await supabase.from('products').upsert(payload, { onConflict: 'id' }).select();
    } else {
      res = await supabase.from('products').upsert(payload, { onConflict: 'slug' }).select();
    }

    const { data, error } = res;

    if (error) {
      console.error('[dbService] Erro ao salvar produto no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }

    if (data && data[0] && data[0].id) {
      product.id = data[0].id;
    }
  }

  const local = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  let current: Product[] = [];
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = [];
    }
  }

  const exists = current.some(p => p.id === product.id);
  const updatedList = exists
    ? current.map(p => p.id === product.id ? product : p)
    : [product, ...current];
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList));

  return { success: true, product };
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (local) {
    try {
      const current: Product[] = JSON.parse(local);
      const filtered = current.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));
    } catch {}
  }

  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = isUuid
      ? supabase.from('products').delete().eq('id', id)
      : supabase.from('products').delete().eq('slug', id);

    const { error } = await query;
    if (error) {
      console.error('[dbService] Erro ao excluir produto no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }
  }
  return true;
}

// =========================================================================
// 3. PRAYERS DATABASE SERVICE (100% DINÂMICO SUPABASE)
// =========================================================================

export async function fetchPrayersFromDb(): Promise<PrayerItem[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .order('is_featured_today', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[dbService] Erro ao buscar orações do Supabase:', error);
      }

      if (!error && data) {
        const mapped: PrayerItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title || '',
          category: item.situation || item.category || 'diarias',
          text: item.content || item.text || '',
          description: item.description || '',
          isDaySpecial: Boolean(item.is_featured_today),
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=800'
        }));

        localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase prayers fetch warning:', err);
  }

  const local = localStorage.getItem(STORAGE_KEY_PRAYERS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }
  return [];
}

export async function savePrayerToDb(prayer: PrayerItem): Promise<{ success: boolean; prayer: PrayerItem }> {
  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prayer.id);
    const payload: any = {
      title: prayer.title,
      slug: prayer.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      situation: prayer.category || 'diarias',
      category: prayer.category || 'diarias',
      content: prayer.text || prayer.content || '',
      text: prayer.text || prayer.content || '',
      description: prayer.description || '',
      is_featured_today: !!(prayer.isDaySpecial),
      image_url: prayer.imageUrl || null
    };

    let res;
    if (isUuid) {
      payload.id = prayer.id;
      res = await supabase.from('prayers').upsert(payload, { onConflict: 'id' }).select();
    } else {
      res = await supabase.from('prayers').upsert(payload, { onConflict: 'slug' }).select();
    }

    const { data, error } = res;

    if (error) {
      console.error('[dbService] Erro ao salvar oração no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }

    if (data && data[0] && data[0].id) {
      prayer.id = data[0].id;
    }
  }

  const local = localStorage.getItem(STORAGE_KEY_PRAYERS);
  let current: PrayerItem[] = [];
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = [];
    }
  }

  const exists = current.some(p => p.id === prayer.id);
  const updatedList = exists
    ? current.map(p => p.id === prayer.id ? prayer : p)
    : [prayer, ...current];
  localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(updatedList));

  return { success: true, prayer };
}

export async function deletePrayerFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_PRAYERS);
  if (local) {
    try {
      const current: PrayerItem[] = JSON.parse(local);
      const filtered = current.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(filtered));
    } catch {}
  }

  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = isUuid
      ? supabase.from('prayers').delete().eq('id', id)
      : supabase.from('prayers').delete().eq('slug', id);

    const { error } = await query;
    if (error) {
      console.error('[dbService] Erro ao excluir oração no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }
  }
  return true;
}

// =========================================================================
// 4. SAINTS / SANTORAL DATABASE SERVICE (100% DINÂMICO SUPABASE)
// =========================================================================

export async function fetchSaintsFromDb(): Promise<Saint[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('saints')
        .select('*')
        .order('feast_month', { ascending: true })
        .order('feast_day', { ascending: true })
        .limit(400);

      if (error) {
        console.error('[dbService] Erro ao buscar santos do Supabase:', error);
      }

      if (!error && data) {
        const mapped: Saint[] = data.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          title: item.title || '',
          feastDate: item.feast_date || `${item.feast_day} de ${getMonthName(item.feast_month)}`,
          month: item.feast_month || 1,
          day: item.feast_day || 1,
          imageUrl: (item.image_url && item.image_url.startsWith('http') && !item.image_url.startsWith('data:'))
            ? item.image_url
            : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
          patronage: item.patronage || 'Igreja Católica',
          summary: item.summary || item.short_bio || '',
          fullBio: item.full_bio || '',
          prayer: item.prayer || '',
          quotes: item.quotes || [],
          featured: Boolean(item.featured)
        }));

        localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase saints fetch warning:', err);
  }

  const local = localStorage.getItem(STORAGE_KEY_SAINTS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Busca de alta precisão pelo Santo do Dia atual (ou do fuso brasileiro)
 * Ordem de Prioridade:
 * 1. Supabase public.saints por feast_month e feast_day
 * 2. Supabase public.articles categoria 'Santo do Dia' de hoje
 * 3. Fallback canônico infalível: Martirológio Romano oficial
 */
export async function fetchSaintOfToday(): Promise<Saint> {
  const now = new Date();
  let day = now.getDate();
  let month = now.getMonth() + 1;

  try {
    const brDateStr = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const [diaStr, mesStr] = brDateStr.split('/');
    if (diaStr && mesStr) {
      day = parseInt(diaStr, 10);
      month = parseInt(mesStr, 10);
    }
  } catch (e) {
    console.warn('[fetchSaintOfToday] Fallback de timezone:', e);
  }

  if (isSupabaseConfigured) {
    try {
      // 1. Busca na tabela de santos por dia e mês de hoje
      const { data, error } = await supabase
        .from('saints')
        .select('*')
        .eq('feast_month', month)
        .eq('feast_day', day)
        .limit(1);

      if (!error && data && data.length > 0) {
        const item = data[0];
        const validImage = (item.image_url && item.image_url.startsWith('http') && !item.image_url.startsWith('data:'))
          ? item.image_url
          : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200';

        return {
          id: item.id,
          name: item.name || '',
          title: item.title || '',
          feastDate: item.feast_date || `${day} de ${getMonthName(month)}`,
          month: item.feast_month || month,
          day: item.feast_day || day,
          imageUrl: validImage,
          patronage: item.patronage || 'Igreja Católica',
          summary: item.summary || item.short_bio || '',
          fullBio: item.full_bio || '',
          prayer: item.prayer || '',
          quotes: item.quotes || [],
          featured: true
        };
      }

      // 2. Busca na tabela de artigos por Santo do Dia publicado
      const { data: artData } = await supabase
        .from('articles')
        .select('*')
        .or(`category.eq.Santo do Dia,slug.ilike.%santo-do-dia%`)
        .order('published_at', { ascending: false })
        .limit(1);

      if (artData && artData.length > 0) {
        const art = artData[0];
        return {
          id: art.id,
          name: art.title.replace(/^Santo do Dia:\s*/i, ''),
          title: 'Memória Sagrada de Hoje',
          feastDate: `${day} de ${getMonthName(month)}`,
          month,
          day,
          imageUrl: art.cover_image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
          patronage: 'Igreja Católica',
          summary: art.excerpt || '',
          fullBio: art.content || '',
          prayer: 'Concedei-nos, Senhor, a graça de imitar a santidade e a dedicação dos vossos santos. Amém.',
          featured: true
        };
      }
    } catch (err) {
      console.warn('[dbService] Erro ao consultar Santo do Dia no Supabase:', err);
    }
  }

  // 3. Fallback canônico do Martirológio Romano
  return obterSantoDoCalendario(month, day);
}

export async function saveSaintToDb(saint: Saint): Promise<{ success: boolean; saint: Saint }> {
  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saint.id);
    const payload: any = {
      name: saint.name,
      slug: saint.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      title: saint.title || '',
      feast_month: saint.month || 1,
      feast_day: saint.day || 1,
      feast_date: saint.feastDate || `${saint.day} de ${getMonthName(saint.month)}`,
      image_url: saint.imageUrl || null,
      patronage: saint.patronage || '',
      summary: saint.summary || '',
      short_bio: saint.summary || '',
      full_bio: saint.fullBio || '',
      prayer: saint.prayer || '',
      quotes: saint.quotes || [],
      featured: !!saint.featured
    };

    let res;
    if (isUuid) {
      payload.id = saint.id;
      res = await supabase.from('saints').upsert(payload, { onConflict: 'id' }).select();
    } else {
      res = await supabase.from('saints').upsert(payload, { onConflict: 'slug' }).select();
    }

    const { data, error } = res;

    if (error) {
      console.error('[dbService] Erro ao salvar santo no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }

    if (data && data[0] && data[0].id) {
      saint.id = data[0].id;
    }
  }

  const local = localStorage.getItem(STORAGE_KEY_SAINTS);
  let current: Saint[] = [];
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = [];
    }
  }

  const exists = current.some(s => s.id === saint.id);
  const updatedList = exists
    ? current.map(s => s.id === saint.id ? saint : s)
    : [saint, ...current];
  localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(updatedList));

  return { success: true, saint };
}

export async function deleteSaintFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_SAINTS);
  if (local) {
    try {
      const current: Saint[] = JSON.parse(local);
      const filtered = current.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(filtered));
    } catch {}
  }

  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = isUuid
      ? supabase.from('saints').delete().eq('id', id)
      : supabase.from('saints').delete().eq('slug', id);

    const { error } = await query;
    if (error) {
      console.error('[dbService] Erro ao excluir santo no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }
  }
  return true;
}

// =========================================================================
// 5. SITE SETTINGS & CMS GLOBAL DATABASE SERVICE
// =========================================================================

const STORAGE_KEY_SITE_SETTINGS = 'eclesia_db_site_settings';

export async function fetchSiteSettingsFromDb(): Promise<any | null> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data?.settings) {
        localStorage.setItem(STORAGE_KEY_SITE_SETTINGS, JSON.stringify(data.settings));
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase site settings fetch warning:', err);
  }

  const local = localStorage.getItem(STORAGE_KEY_SITE_SETTINGS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveSiteSettingsToDb(settings: any): Promise<{ success: boolean; settings: any }> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          id: 'default',
          settings: settings,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('[dbService] Erro ao salvar configurações no Supabase:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message}`);
    }
  }

  localStorage.setItem(STORAGE_KEY_SITE_SETTINGS, JSON.stringify(settings));
  return { success: true, settings };
}

function getMonthName(month: number): string {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[month - 1] || 'Janeiro';
}
