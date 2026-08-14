import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Essay, Product, PrayerItem, Saint } from '../types';
import { ESSAYS_DATA, PRODUCTS_DATA, SAINTS_DATA } from '../data/eclesiaData';
import { PRAYERS_DATA } from '../components/OraçõesView';

const STORAGE_KEY_ARTICLES = 'eclesia_db_articles';
const STORAGE_KEY_PRODUCTS = 'eclesia_db_products';
const STORAGE_KEY_PRAYERS = 'eclesia_db_prayers';
const STORAGE_KEY_SAINTS = 'eclesia_db_saints';

// =========================================================================
// 1. ARTICLES / BLOG DATABASE SERVICE
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
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Essay[] = data.map((item: any) => {
          const localItem = localArticles.find(l => l.id === item.id || (l.slug && item.slug && l.slug === item.slug));
          return {
            id: item.id,
            title: localItem?.title || item.title,
            category: localItem?.category || item.category || 'Teologia',
            type: localItem?.type || item.type || 'artigo',
            imageUrl: localItem?.imageUrl || item.cover_image || item.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
            excerpt: localItem?.excerpt || item.excerpt || '',
            content: localItem?.content || item.content || '',
            author: localItem?.author || item.author || 'Redação Eclesia',
            readTime: localItem?.readTime || item.read_time || '5 min',
            date: item.published_at ? new Date(item.published_at).toLocaleDateString('pt-BR') : (localItem?.date || 'Hoje'),
            featured: localItem?.featured ?? item.featured,
            trending: localItem?.trending ?? item.trending,
            slug: item.slug,
            metaTitle: localItem?.metaTitle || item.meta_title || item.title,
            metaDescription: localItem?.metaDescription || item.meta_description || item.excerpt,
            keywords: localItem?.keywords || item.keywords || [],
            mediaMap: localItem?.mediaMap || item.mediaMap
          };
        });

        // Retain any newly created local articles not yet in Supabase
        const combined = [
          ...mapped,
          ...localArticles.filter(l => !mapped.some(m => m.id === l.id || (m.slug && l.slug && m.slug === l.slug)))
        ];

        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('Supabase articles fetch fallback to local:', err);
  }

  if (localArticles.length > 0) {
    return localArticles;
  }
  return ESSAYS_DATA;
}

export async function saveArticleToDb(article: Essay): Promise<{ success: boolean; article: Essay }> {
  // 1. Immediately update localStorage with the edited article
  const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
  let current: Essay[] = ESSAYS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = ESSAYS_DATA;
    }
  }

  const exists = current.some(a => a.id === article.id || (a.slug && article.slug && a.slug === article.slug));
  const updatedList = exists
    ? [article, ...current.filter(a => !(a.id === article.id || (a.slug && article.slug && a.slug === article.slug)))]
    : [article, ...current];
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(updatedList));

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(article.id);
      const payload: any = {
        title: article.title,
        slug: article.slug || article.title.toLowerCase().replace(/\s+/g, '-'),
        excerpt: article.excerpt,
        content: article.content,
        cover_image: article.imageUrl,
        category: article.category,
        type: article.type || 'artigo',
        meta_title: article.metaTitle,
        meta_description: article.metaDescription,
        keywords: article.keywords,
        status: 'publicado',
        published_at: new Date().toISOString()
      };

      if (isUuid) {
        payload.id = article.id;
      }

      await supabase.from('articles').upsert(payload, { onConflict: 'slug' });
    } catch (err) {
      console.warn('Supabase articles upsert warning:', err);
    }
  }

  return { success: true, article };
}

export async function deleteArticleFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_ARTICLES);
  let current: Essay[] = ESSAYS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = ESSAYS_DATA;
    }
  }

  const filtered = current.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(filtered));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('articles').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase article delete warning:', err);
    }
  }
  return true;
}

// =========================================================================
// 2. PRODUCTS / STORE DATABASE SERVICE
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
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Product[] = data.map((item: any) => {
          const localItem = localProducts.find(l => l.id === item.id);
          return {
            id: item.id,
            title: localItem?.title || item.name || item.title,
            subtitle: localItem?.subtitle || item.subtitle || '',
            price: localItem?.price ?? ((item.price_cents ? item.price_cents / 100 : item.price) || 0),
            category: (localItem?.category || item.category || 'livro') as any,
            imageUrl: localItem?.imageUrl || (item.images && item.images[0]) || item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
            description: localItem?.description || item.description || '',
            inStock: localItem?.inStock ?? (item.stock !== undefined ? item.stock > 0 : (item.inStock ?? true)),
            buyUrl: localItem?.buyUrl || item.buy_url || item.buyUrl || ''
          };
        });

        const combined = [
          ...mapped,
          ...localProducts.filter(l => !mapped.some(m => m.id === l.id))
        ];

        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('Supabase products fetch fallback:', err);
  }

  if (localProducts.length > 0) {
    return localProducts;
  }
  return PRODUCTS_DATA;
}

export async function saveProductToDb(product: Product): Promise<{ success: boolean; product: Product }> {
  const local = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  let current: Product[] = PRODUCTS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = PRODUCTS_DATA;
    }
  }

  const exists = current.some(p => p.id === product.id);
  const updatedList = exists
    ? current.map(p => p.id === product.id ? product : p)
    : [product, ...current];
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('products').upsert({
        id: product.id.includes('-') && !product.id.startsWith('prod-') ? product.id : undefined,
        name: product.title,
        slug: product.title.toLowerCase().replace(/\s+/g, '-'),
        subtitle: product.subtitle,
        description: product.description,
        price_cents: Math.round(product.price * 100),
        images: [product.imageUrl],
        stock: product.inStock ? 50 : 0,
        category: product.category,
        active: true,
        buy_url: product.buyUrl
      });
    } catch (err) {
      console.warn('Supabase product upsert warning:', err);
    }
  }

  return { success: true, product };
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  let current: Product[] = PRODUCTS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = PRODUCTS_DATA;
    }
  }

  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase product delete warning:', err);
    }
  }
  return true;
}

// =========================================================================
// 3. PRAYERS DATABASE SERVICE
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

      if (!error && data && data.length > 0) {
        const mapped: PrayerItem[] = data.map((item: any) => {
          const localItem = localPrayers.find(l => l.id === item.id);
          return {
            id: item.id,
            title: localItem?.title || item.title,
            category: (localItem?.category || (item.situation === 'latim' ? 'latim' : item.situation === 'mariana' ? 'marianas' : item.situation === 'santos' ? 'santos' : 'diarias')) as any,
            text: localItem?.text || item.content || item.text || '',
            content: localItem?.content || item.content || item.text || '',
            description: localItem?.description || item.description || '',
            isDaySpecial: localItem?.isDaySpecial ?? (item.is_featured_today ?? item.isDaySpecial),
            imageUrl: localItem?.imageUrl || item.image_url || item.imageUrl || ''
          };
        });

        const combined = [
          ...mapped,
          ...localPrayers.filter(l => !mapped.some(m => m.id === l.id))
        ];

        localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('Supabase prayers fetch fallback:', err);
  }

  if (localPrayers.length > 0) {
    return localPrayers;
  }
  return PRAYERS_DATA;
}

export async function savePrayerToDb(prayer: PrayerItem): Promise<{ success: boolean; prayer: PrayerItem }> {
  const local = localStorage.getItem(STORAGE_KEY_PRAYERS);
  let current: PrayerItem[] = PRAYERS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = PRAYERS_DATA;
    }
  }

  const exists = current.some(p => p.id === prayer.id);
  const updatedList = exists
    ? current.map(p => p.id === prayer.id ? prayer : p)
    : [prayer, ...current];
  localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(updatedList));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('prayers').upsert({
        id: prayer.id.includes('-') && !prayer.id.startsWith('prayer-') ? prayer.id : undefined,
        title: prayer.title,
        slug: prayer.slug || prayer.title.toLowerCase().replace(/\s+/g, '-'),
        situation: prayer.category || prayer.situation,
        content: prayer.text || prayer.content,
        is_featured_today: !!(prayer.isDaySpecial || prayer.isFeaturedToday),
        featured_date: (prayer.isDaySpecial || prayer.isFeaturedToday) ? new Date().toISOString().split('T')[0] : null,
        image_url: prayer.imageUrl
      });
    } catch (err) {
      console.warn('Supabase prayer upsert warning:', err);
    }
  }

  return { success: true, prayer };
}

export async function deletePrayerFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_PRAYERS);
  let current: PrayerItem[] = PRAYERS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = PRAYERS_DATA;
    }
  }

  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PRAYERS, JSON.stringify(filtered));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('prayers').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase prayer delete warning:', err);
    }
  }
  return true;
}

// =========================================================================
// 4. SAINTS / SANTORAL DATABASE SERVICE
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
        .order('month', { ascending: true })
        .order('day', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Saint[] = data.map((item: any) => {
          const localItem = localSaints.find(l => l.id === item.id || l.id === item.slug);
          return {
            id: item.id || item.slug,
            name: localItem?.name || item.name,
            title: localItem?.title || item.title || '',
            feastDate: localItem?.feastDate || item.feast_date || item.feastDate || `${item.day} de Mês`,
            month: localItem?.month || item.month || 1,
            day: localItem?.day || item.day || 1,
            imageUrl: localItem?.imageUrl || item.image_url || item.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
            patronage: localItem?.patronage || item.patronage || '',
            summary: localItem?.summary || item.summary || '',
            fullBio: localItem?.fullBio || item.full_bio || item.fullBio || '',
            prayer: localItem?.prayer || item.prayer || '',
            quotes: localItem?.quotes || item.quotes || [],
            featured: localItem?.featured ?? item.featured
          };
        });

        const combined = [
          ...mapped,
          ...localSaints.filter(l => !mapped.some(m => m.id === l.id || m.id === l.name))
        ];

        localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('Supabase saints fetch fallback:', err);
  }

  if (localSaints.length > 0) {
    return localSaints;
  }
  return SAINTS_DATA;
}

export async function saveSaintToDb(saint: Saint): Promise<{ success: boolean; saint: Saint }> {
  const local = localStorage.getItem(STORAGE_KEY_SAINTS);
  let current: Saint[] = SAINTS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = SAINTS_DATA;
    }
  }

  const exists = current.some(s => s.id === saint.id);
  const updatedList = exists
    ? current.map(s => s.id === saint.id ? saint : s)
    : [saint, ...current];
  localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(updatedList));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('saints').upsert({
        id: saint.id.includes('-') && !saint.id.startsWith('saint-') ? saint.id : undefined,
        name: saint.name,
        slug: saint.id,
        title: saint.title,
        feast_date: saint.feastDate,
        month: saint.month,
        day: saint.day,
        image_url: saint.imageUrl,
        patronage: saint.patronage,
        summary: saint.summary,
        full_bio: saint.fullBio,
        prayer: saint.prayer,
        featured: !!saint.featured
      });
    } catch (err) {
      console.warn('Supabase saint upsert warning:', err);
    }
  }

  return { success: true, saint };
}

export async function deleteSaintFromDb(id: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY_SAINTS);
  let current: Saint[] = SAINTS_DATA;
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      current = SAINTS_DATA;
    }
  }

  const filtered = current.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY_SAINTS, JSON.stringify(filtered));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('saints').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase saint delete warning:', err);
    }
  }
  return true;
}
