/**
 * Handler HTTP da Liturgia Diária
 * Compatível com Cloudflare Workers (Web API padrão: Request / Response)
 */
import { gerarLiturgiaDiaria } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

export async function handleLiturgia(req: Request, env?: Record<string, string>): Promise<Response> {
  const cronSecret = (env?.CRON_SECRET) ?? (typeof process !== 'undefined' ? process.env.CRON_SECRET : undefined);
  const authHeader = req.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente.' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const targetDate = url.searchParams.get('date') ?? undefined;
    const force = url.searchParams.get('force') === 'true' || url.searchParams.get('force') === '1';

    console.log(`[CF Cron] Iniciando publicação da Liturgia Diária (Data: ${targetDate || 'Hoje BRT'})...`);
    const result = await gerarLiturgiaDiaria(targetDate, force);

    console.log('[CF Cron] Notificando mecanismos de busca sobre nova Liturgia Diária...');
    await Promise.allSettled([
      submitToIndexNow([`${SITE_URL}/liturgia`, `${SITE_URL}/`, `${SITE_URL}/sitemap.xml`]),
      pingSearchEnginesSitemap()
    ]);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      liturgy: result.liturgy,
      article: result.article
    });
  } catch (error: any) {
    console.error('[CF Cron Error - Liturgia]:', error);
    return Response.json({
      success: false,
      error: error.message || 'Erro ao gerar liturgia diária com IA'
    }, { status: 500 });
  }
}

/** Exportação padrão para uso direto como Cloudflare Pages Function */
export default {
  async fetch(req: Request, env: any): Promise<Response> {
    return handleLiturgia(req, env);
  }
};
