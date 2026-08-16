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
  const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
  let localArticles: Essay[] = [];
  if (local) {
    try {
      localArticles = JSON.parse(local);
    } catch {
      localArticles = [];
    }
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: Essay[] = data.map((item: any) => {
          const localItem = localArticles.find(l => l.id === item.id || (l.slug && item.slug && l.slug === item.slug));
          return {
            id: item.id,
            title: item.title || localItem?.title || '',
            category: item.category || localItem?.category || 'Teologia',
            type: item.type || localItem?.type || 'artigo',
            imageUrl: item.cover_image || localItem?.imageUrl || 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
            excerpt: item.excerpt || localItem?.excerpt || '',
            content: item.content || localItem?.content || '',
            author: item.author_name || localItem?.author || 'Redação Eclesia',
            readTime: item.read_time || localItem?.readTime || '5 min de leitura',
            date: item.published_at
              ? new Date(item.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              : (localItem?.date || 'Recente'),
            featured: Boolean(item.featured ?? localItem?.featured),
            trending: Boolean(item.trending ?? localItem?.trending),
            slug: item.slug,
            metaTitle: item.meta_title || localItem?.metaTitle || item.title,
            metaDescription: item.meta_description || localItem?.metaDescription || item.excerpt,
            keywords: item.keywords || localItem?.keywords || [],
            mediaMap: item.media_map || localItem?.mediaMap
          };
        });

        // Mescla artigos criados localmente que ainda não foram sincronizados
        const unsynced = localArticles.filter(l => !mapped.some(m => m.id === l.id || (m.slug && l.slug && m.slug === l.slug)));
        const combined = [...mapped, ...unsynced];

        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase articles fetch warning:', err);
  }

  return localArticles;
}

export async function saveArticleToDb(article: Essay): Promise<{ success: boolean; article: Essay }> {
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

  if (isSupabaseConfigured) {
    try {
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
        console.error('[dbService] Erro ao salvar artigo no Supabase:', error);
      } else if (data && data[0]) {
        console.log('[dbService] Artigo salvo com sucesso no Supabase:', data[0]);
      }
    } catch (err) {
      console.warn('[dbService] Supabase articles upsert warning:', err);
    }
  }

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

// =========================================================================
// 2. PRODUCTS / STORE DATABASE SERVICE (100% DINÂMICO SUPABASE)
// =========================================================================

export async function fetchProductsFromDb(): Promise<Product[]> {
  const local = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  let localProducts: Product[] = [];
  if (local) {
    try {
      localProducts = JSON.parse(local);
    } catch {
      localProducts = [];
    }
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: Product[] = data.map((item: any) => {
          const localItem = localProducts.find(l => l.id === item.id);
          return {
            id: item.id,
            title: item.name || localItem?.title || '',
            subtitle: item.subtitle || localItem?.subtitle || '',
            price: item.price_cents !== undefined ? item.price_cents / 100 : (localItem?.price ?? 0),
            category: (item.category || localItem?.category || 'livro') as any,
            imageUrl: (item.images && item.images[0]) || item.image_url || localItem?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
            description: item.description || localItem?.description || '',
            inStock: item.stock !== undefined ? item.stock > 0 : (localItem?.inStock ?? true),
            buyUrl: item.buy_url || localItem?.buyUrl || ''
          };
        });

        const unsynced = localProducts.filter(l => !mapped.some(m => m.id === l.id));
        const combined = [...mapped, ...unsynced];

        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase products fetch warning:', err);
  }

  return localProducts;
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
  const local = localStorage.getItem(STORAGE_KEY_PRAYERS);
  let localPrayers: PrayerItem[] = [];
  if (local) {
    try {
      localPrayers = JSON.parse(local);
    } catch {
      localPrayers = [];
    }
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: PrayerItem[] = data.map((item: any) => {
          const localItem = localPrayers.find(l => l.id === item.id);
          return {
            id: item.id,
            title: item.title || localItem?.title || '',
            category: (item.category || item.situation || localItem?.category || 'diarias') as any,
            text: item.text || item.content || localItem?.text || '',
            content: item.content || item.text || localItem?.content || '',
            description: item.description || localItem?.description || '',
            isDaySpecial: Boolean(item.is_featured_today ?? localItem?.isDaySpecial),
            imageUrl: item.image_url || localItem?.imageUrl || ''
          };
        });

        const unsynced = localPrayers.filter(l => !mapped.some(m => m.id === l.id));
        const combined = [...mapped, ...unsynced];

        localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase prayers fetch warning:', err);
  }

  return localPrayers;
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
  const local = localStorage.getItem(STORAGE_KEY_SAINTS);
  let localSaints: Saint[] = [];
  if (local) {
    try {
      localSaints = JSON.parse(local);
    } catch {
      localSaints = [];
    }
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('saints')
        .select('*')
        .order('feast_month', { ascending: true })
        .order('feast_day', { ascending: true });

      if (!error && data) {
        const mapped: Saint[] = data.map((item: any) => {
          const localItem = localSaints.find(l => l.id === item.id || l.id === item.slug);
          return {
            id: item.id || item.slug,
            name: item.name || localItem?.name || '',
            title: item.title || localItem?.title || '',
            feastDate: item.feast_date || localItem?.feastDate || `${item.feast_day || item.day || 1} de Mês`,
            month: item.feast_month || item.month || 1,
            day: item.feast_day || item.day || 1,
            imageUrl: item.image_url || localItem?.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
            patronage: item.patronage || localItem?.patronage || '',
            summary: item.summary || item.short_bio || localItem?.summary || '',
            fullBio: item.full_bio || localItem?.fullBio || '',
            prayer: item.prayer || localItem?.prayer || '',
            quotes: item.quotes || localItem?.quotes || [],
            featured: Boolean(item.featured ?? localItem?.featured)
          };
        });

        const unsynced = localSaints.filter(l => !mapped.some(m => m.id === l.id || m.id === l.name));
        const combined = [...mapped, ...unsynced];

        localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('[dbService] Supabase saints fetch warning:', err);
  }

  return localSaints;
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
