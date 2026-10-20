import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gerarLiturgiaDiaria } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente.' });
  }

  try {
    const targetDate = typeof req.query.date === 'string' ? req.query.date : undefined;
    const force = req.query.force === 'true' || req.query.force === '1';

    console.log(`[Vercel Cron] Iniciando publicação da Liturgia Diária da Palavra (Data: ${targetDate || 'Hoje BRT'})...`);
    const result = await gerarLiturgiaDiaria(targetDate, force);

    // Notificação imediata ao Google, Bing e Yandex sobre nova liturgia
    console.log('[Vercel Cron] Notificando mecanismos de busca sobre nova Liturgia Diária...');
    await Promise.allSettled([
      submitToIndexNow([`${SITE_URL}/liturgia`, `${SITE_URL}/`, `${SITE_URL}/sitemap.xml`]),
      pingSearchEnginesSitemap()
    ]);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      liturgy: result.liturgy,
      article: result.article
    });
  } catch (error: any) {
    console.error('[Vercel Cron Error - Liturgia]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerar liturgia diária com IA'
    });
  }
}
