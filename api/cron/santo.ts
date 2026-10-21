/**
 * Handler HTTP do Santo do Dia
 * Compatível com Cloudflare Workers (Web API padrão: Request / Response)
 */
import { gerarSantoDoDia } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

export async function handleSanto(req: Request, env?: Record<string, string>): Promise<Response> {
  const cronSecret = (env?.CRON_SECRET) ?? (typeof process !== 'undefined' ? process.env.CRON_SECRET : undefined);
  const authHeader = req.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente.' }, { status: 401 });
  }

  try {
    console.log('[CF Cron] Iniciando publicação do Santo do Dia (Santoral)...');
    const result = await gerarSantoDoDia();

    const saintId = result?.saint?.id || result?.saint?.slug;
    const urls = [`${SITE_URL}/santoral`, `${SITE_URL}/sitemap.xml`];
    if (saintId) urls.unshift(`${SITE_URL}/santoral/${saintId}`);

    console.log('[CF Cron] Notificando mecanismos de busca sobre novo Santo do Dia...');
    await Promise.allSettled([
      submitToIndexNow(urls),
      pingSearchEnginesSitemap()
    ]);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      saint: result.saint,
      article: result.article
    });
  } catch (error: any) {
    console.error('[CF Cron Error - Santo do Dia]:', error);
    return Response.json({
      success: false,
      error: error.message || 'Erro ao gerar Santo do Dia com IA'
    }, { status: 500 });
  }
}

/** Exportação padrão para uso direto como Cloudflare Pages Function */
export default {
  async fetch(req: Request, env: any): Promise<Response> {
    return handleSanto(req, env);
  }
};
