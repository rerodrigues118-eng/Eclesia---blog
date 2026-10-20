import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gerarArtigoEmAlta } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificação opcional do CRON_SECRET para segurança em produção
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente.' });
  }

  try {
    const slotQuery = req.query.slot ? parseInt(req.query.slot as string, 10) : 1;
    const slot = isNaN(slotQuery) || slotQuery < 1 || slotQuery > 4 ? 1 : slotQuery;

    console.log(`[Vercel Cron] Iniciando geração de Artigo Católico em Alta (Slot ${slot})...`);
    const result = await gerarArtigoEmAlta(slot);

    // Notificação imediata ao Google, Bing e Yandex após publicação
    if (result?.article?.slug) {
      const articleUrl = `${SITE_URL}/blog/${result.article.slug}`;
      console.log(`[Vercel Cron] Notificando mecanismos de busca sobre novo artigo: ${articleUrl}`);
      await Promise.allSettled([
        submitToIndexNow([articleUrl, `${SITE_URL}/blog`, `${SITE_URL}/sitemap.xml`]),
        pingSearchEnginesSitemap()
      ]);
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      slot,
      trendUsed: result.trendUsed || null,
      cover_image: result.article?.cover_image || null,
      article: result.article
    });
  } catch (error: any) {
    console.error('[Vercel Cron Error - Artigo]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerar artigo católico com IA'
    });
  }
}
