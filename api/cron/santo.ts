import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gerarSantoDoDia } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente.' });
  }

  try {
    console.log('[Vercel Cron] Iniciando publicação do Santo do Dia (Santoral)...');
    const result = await gerarSantoDoDia();

    // Notificação imediata ao Google, Bing e Yandex sobre novo Santo do Dia
    const saintId = result?.saint?.id || result?.saint?.slug;
    const urls = [`${SITE_URL}/santoral`, `${SITE_URL}/sitemap.xml`];
    if (saintId) urls.unshift(`${SITE_URL}/santoral/${saintId}`);

    console.log('[Vercel Cron] Notificando mecanismos de busca sobre novo Santo do Dia...');
    await Promise.allSettled([
      submitToIndexNow(urls),
      pingSearchEnginesSitemap()
    ]);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      saint: result.saint,
      article: result.article
    });
  } catch (error: any) {
    console.error('[Vercel Cron Error - Santo do Dia]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerar Santo do Dia com IA'
    });
  }
}
