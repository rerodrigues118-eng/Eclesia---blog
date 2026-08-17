import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Essay, Product, PrayerItem, Saint } from '../types';

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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[dbService] Erro ao buscar artigos do Supabase:', error);
      }

      if (!error && data) {
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

        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase articles fetch warning:', err);
  }

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
  if (isSupabaseConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(article.id);
    const payload: any = {
      title: article.title,
      slug: article.slug || article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      excerpt: article.excerpt || '',
      content: article.content || '',
      cover_image: article.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
      category: article.category || 'Teologia',
      type: article.type || 'artigo',
      author_name: article.author || 'Redação Eclesia',
      read_time: article.readTime || '5 min de leitura',
      featured: !!article.featured,
      trending: !!article.trending,
      meta_title: article.metaTitle || article.title,
      meta_description: article.metaDescription || article.excerpt,
      keywords: article.keywords || [],
      media_map: article.mediaMap || null,
      status: 'publicado',
      published_at: new Date().toISOString()
    };

    if (isUuid) {
      payload.id = article.id;
    }

    const { data, error } = await supabase.from('articles').upsert(payload, { onConflict: 'slug' }).select();

    if (error) {
      console.error('[dbService] Erro retornado pelo Supabase no salvar artigo:', error);
      throw new Error(`[Supabase ${error.code || 'ERR'}]: ${error.message} ${error.details || ''} ${error.hint || ''}`.trim());
    }

    if (data && data[0]) {
      console.log('[dbService] Artigo salvo com sucesso no Supabase:', data[0]);
    }
  }

  // Atualiza cache local de backup
  const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
  let current: Essay[] = [];
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = [];
    }
  }
  const exists = current.some(a => a.id === article.id || (a.slug && article.slug && a.slug === article.slug));
  const updatedList = exists
    ? current.map(a => (a.id === article.id || (a.slug && article.slug && a.slug === article.slug)) ? article : a)
    : [article, ...current];
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(updatedList));

  return { success: true, article };
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
    try {
      await supabase.from('articles').delete().eq('id', id);
    } catch (err) {
      console.warn('[dbService] Supabase article delete warning:', err);
    }
  }
  return true;
}

export async function fetchProductsFromDb(): Promise<Product[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[dbService] Erro ao buscar produtos do Supabase:', error);
      }

      if (!error && data) {
        const mapped: Product[] = data.map((item: any) => ({
          id: item.id,
          title: item.name || '',
          subtitle: item.subtitle || '',
          price: item.price_cents !== undefined ? item.price_cents / 100 : 0,
          category: (item.category || 'livro') as any,
          imageUrl: (item.images && item.images[0]) || item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          description: item.description || '',
          inStock: item.stock !== undefined ? item.stock > 0 : true,
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

  if (isSupabaseConfigured) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
      const payload: any = {
        name: product.title,
        slug: product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        subtitle: product.subtitle,
        description: product.description,
        price_cents: Math.round((product.price || 0) * 100),
        images: product.imageUrl ? [product.imageUrl] : [],
        stock: product.inStock ? 50 : 0,
        category: product.category || 'livro',
        active: true,
        buy_url: product.buyUrl
      };

      if (isUuid) {
        payload.id = product.id;
      }

      await supabase.from('products').upsert(payload, { onConflict: 'slug' });
    } catch (err) {
      console.warn('[dbService] Supabase product upsert warning:', err);
    }
  }

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
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('[dbService] Supabase product delete warning:', err);
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[dbService] Erro ao buscar orações do Supabase:', error);
      }

      if (!error && data) {
        const mapped: PrayerItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title || '',
          category: (item.category || item.situation || 'diarias') as any,
          text: item.text || item.content || '',
          content: item.content || item.text || '',
          description: item.description || '',
          isDaySpecial: Boolean(item.is_featured_today),
          imageUrl: item.image_url || ''
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

  if (isSupabaseConfigured) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prayer.id);
      const payload: any = {
        title: prayer.title,
        slug: prayer.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        situation: prayer.category || 'diarias',
        category: prayer.category || 'diarias',
        content: prayer.text || prayer.content || '',
        text: prayer.text || prayer.content || '',
        description: prayer.description,
        is_featured_today: !!(prayer.isDaySpecial),
        image_url: prayer.imageUrl
      };

      if (isUuid) {
        payload.id = prayer.id;
      }

      await supabase.from('prayers').upsert(payload, { onConflict: 'slug' });
    } catch (err) {
      console.warn('[dbService] Supabase prayer upsert warning:', err);
    }
  }

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
    try {
      await supabase.from('prayers').delete().eq('id', id);
    } catch (err) {
      console.warn('[dbService] Supabase prayer delete warning:', err);
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
        .order('feast_day', { ascending: true });

      if (error) {
        console.error('[dbService] Erro ao buscar santos do Supabase:', error);
      }

      if (!error && data && data.length > 0) {
        const mapped: Saint[] = data.map((item: any) => {
          const monthNum = parseInt(item.feast_month || item.month || '1', 10);
          const dayNum = parseInt(item.feast_day || item.day || '1', 10);
          return {
            id: item.id || item.slug,
            name: item.name || '',
            title: item.title || '',
            feastDate: item.feast_date || `${dayNum} de Mês`,
            month: isNaN(monthNum) ? 1 : monthNum,
            day: isNaN(dayNum) ? 1 : dayNum,
            imageUrl: item.image_url || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
            patronage: item.patronage || '',
            summary: item.summary || item.short_bio || '',
            fullBio: item.full_bio || '',
            prayer: item.prayer || '',
            quotes: Array.isArray(item.quotes) ? item.quotes : (item.quotes ? [item.quotes] : []),
            featured: Boolean(item.featured)
          };
        });

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

export async function saveSaintToDb(saint: Saint): Promise<{ success: boolean; saint: Saint }> {
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

  if (isSupabaseConfigured) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saint.id);
      const payload: any = {
        name: saint.name,
        slug: saint.id || saint.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        title: saint.title,
        feast_month: saint.month || 1,
        feast_day: saint.day || 1,
        feast_date: saint.feastDate,
        image_url: saint.imageUrl,
        patronage: saint.patronage,
        summary: saint.summary,
        short_bio: saint.summary,
        full_bio: saint.fullBio,
        prayer: saint.prayer,
        quotes: saint.quotes,
        featured: !!saint.featured
      };

      if (isUuid) {
        payload.id = saint.id;
      }

      await supabase.from('saints').upsert(payload, { onConflict: 'slug' });
    } catch (err) {
      console.warn('[dbService] Supabase saint upsert warning:', err);
    }
  }

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
    try {
      await supabase.from('saints').delete().eq('id', id);
    } catch (err) {
      console.warn('[dbService] Supabase saint delete warning:', err);
    }
  }
  return true;
}
