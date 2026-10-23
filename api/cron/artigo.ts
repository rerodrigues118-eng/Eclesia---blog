/**
 * Handler HTTP de Geração de Artigos
 * Compatível com Cloudflare Workers (Web API padrão: Request / Response)
 */
import { gerarArtigoEmAlta } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

/**
 * Inferência de slot com base na hora UTC atual.
 * Slot 1 → 06h BRT (09h UTC)
 * Slot 2 → 10h30 BRT (13h30 UTC)
 * Slot 3 → 15h BRT (18h UTC)
 * Slot 4 → 19h30 BRT (22h30 UTC)
 */
function inferSlotFromHour(): number {
  const utcHours = new Date().getUTCHours();
  if (utcHours >= 6  && utcHours < 12) return 1;
  if (utcHours >= 12 && utcHours < 16) return 2;
  if (utcHours >= 16 && utcHours < 21) return 3;
  return 4;
}

export async function handleArtigo(req: Request, env?: Record<string, string>): Promise<Response> {
  const cronSecret = (env?.CRON_SECRET) ?? (typeof process !== 'undefined' ? process.env.CRON_SECRET : undefined);
  const authHeader = req.headers.get('authorization');
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  if (!isDev && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return Response.json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente no cabeçalho Authorization.' }, { status: 401 });
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Não autorizado. Token Bearer inválido.' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const slotParam = url.searchParams.get('slot');
    const slotParsed = slotParam ? parseInt(slotParam, 10) : NaN;
    const slot = !isNaN(slotParsed) && slotParsed >= 1 && slotParsed <= 4
      ? slotParsed
      : inferSlotFromHour();

    console.log(`[CF Cron] Iniciando geração de Artigo Católico em Alta (Slot ${slot})...`);
    const result = await gerarArtigoEmAlta(slot);

    if (result?.article?.slug) {
      const articleUrl = `${SITE_URL}/blog/${result.article.slug}`;
      console.log(`[CF Cron] Notificando mecanismos de busca: ${articleUrl}`);
      await Promise.allSettled([
        submitToIndexNow([articleUrl, `${SITE_URL}/blog`, `${SITE_URL}/sitemap.xml`]),
        pingSearchEnginesSitemap()
      ]);
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      slot,
      trendUsed: result.trendUsed || null,
      cover_image: result.article?.cover_image || null,
      article: result.article
    });
  } catch (error: any) {
    console.error('[CF Cron Error - Artigo]:', error);
    return Response.json({
      success: false,
      error: error.message || 'Erro ao gerar artigo católico com IA'
    }, { status: 500 });
  }
}

/** Exportação padrão para uso direto como Cloudflare Pages Function */
export default {
  async fetch(req: Request, env: any): Promise<Response> {
    return handleArtigo(req, env);
  }
};
