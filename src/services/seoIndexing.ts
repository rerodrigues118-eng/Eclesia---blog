// ============================================================================
// ECLESIA BLOG CATÓLICO - MOTOR DE INDEXAÇÃO INSTANTÂNEA (INDEXNOW & GOOGLE PING)
// Notifica instantaneamente Google, Bing, Yandex e Seznam sobre novos conteúdos
// ============================================================================

export const INDEXNOW_KEY = '89f4b5e2a3c7491d90f2b38167cd9e12';
export const SITE_HOST = 'eclesia.blog';
export const SITE_URL = `https://${SITE_HOST}`;
export const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Envia URLs para o protocolo IndexNow (Bing, Yandex, Seznam, Naver)
 */
export async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; status?: number; error?: string }> {
  if (!urls || urls.length === 0) return { success: false, error: 'Nenhuma URL fornecida.' };

  const validUrls = urls.map(u => u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`);

  const payload: IndexNowPayload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: validUrls
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] ${validUrls.length} URLs enviadas com sucesso para indexação imediata!`);
      return { success: true, status: response.status };
    } else {
      const errText = await response.text();
      console.warn(`[IndexNow Warning (${response.status})]:`, errText);
      return { success: false, status: response.status, error: errText };
    }
  } catch (err: any) {
    console.error('[IndexNow Exception]:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Dispara ping no Google e Bing para re-rastrear o sitemap.xml
 */
export async function pingSearchEnginesSitemap(): Promise<void> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const endpoints = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: 'GET' });
      console.log(`[Sitemap Ping] Notificado: ${url} (status: ${res.status})`);
    } catch (e) {
      // Pings de sitemap podem retornar CORS ou status sem corpo, ignorar falhas silenciosas
      console.warn(`[Sitemap Ping Warning]:`, e);
    }
  }
}

/**
 * Notificador Central de Novo Conteúdo: Dispara IndexNow + Ping de Sitemap
 */
export async function notifyNewContentPublished(
  pathOrSlug: string, 
  section: 'blog' | 'santoral' | 'liturgia' = 'blog'
): Promise<void> {
  let targetUrl = '';
  if (section === 'liturgia') {
    targetUrl = `${SITE_URL}/liturgia`;
  } else if (section === 'santoral') {
    targetUrl = `${SITE_URL}/santoral/${pathOrSlug}`;
  } else {
    targetUrl = `${SITE_URL}/blog/${pathOrSlug}`;
  }

  // 1. IndexNow para indexação em minutos
  await submitToIndexNow([targetUrl, `${SITE_URL}/sitemap.xml`, SITE_URL]);

  // 2. Ping de sitemap para o Googlebot e Bingbot
  await pingSearchEnginesSitemap();
}
