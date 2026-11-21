/**
 * Handler HTTP de Geração de Artigos
 * Compatível com Cloudflare Workers (Web API padrão: Request / Response)
 */
import { gerarArtigoEmAlta } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

/**
 * Inferência de slot com base na hora UTC atual (Brasil = UTC-3).
 * Slot 1 → 05h00 BRT (08h00 UTC) - Santo do Dia
 * Slot 2 → 07h30 BRT (10h30 UTC) - Notícia 1 (Vaticano & Santa Sé)
 * Slot 3 → 10h30 BRT (13h30 UTC) - Espiritualidade & Dores Contemporâneas 1
 * Slot 4 → 13h30 BRT (16h30 UTC) - Juventude & Vocação
 * Slot 5 → 16h30 BRT (19h30 UTC) - Notícia 2 (Igreja no Brasil & Missão)
 * Slot 6 → 19h30 BRT (22h30 UTC) - Espiritualidade & Dores Contemporâneas 2
 */
function inferSlotFromHour(): number {
  const utcHours = new Date().getUTCHours();
  if (utcHours >= 6 && utcHours < 9) return 1;
  if (utcHours >= 9 && utcHours < 12) return 2;
  if (utcHours >= 12 && utcHours < 15) return 3;
  if (utcHours >= 15 && utcHours < 18) return 4;
  if (utcHours >= 18 && utcHours < 21) return 5;
  return 6;
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
    const slot = !isNaN(slotParsed) && slotParsed >= 1 && slotParsed <= 6
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
