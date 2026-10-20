import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gerarArtigoEmAlta } from '../../src/services/contentAutomation';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

function inferSlotFromHour(): number {
  const now = new Date();
  const utcHours = now.getUTCHours();
  // Slot 1: ~06:00 BRT (09:00 UTC)
  // Slot 2: ~10:30 BRT (13:30 UTC)
  // Slot 3: ~15:00 BRT (18:00 UTC)
  // Slot 4: ~19:30 BRT (22:30 UTC)
  if (utcHours >= 6 && utcHours < 12) return 1;
  if (utcHours >= 12 && utcHours < 16) return 2;
  if (utcHours >= 16 && utcHours < 21) return 3;
  return 4;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificação opcional do CRON_SECRET para segurança em produção
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Não autorizado. CRON_SECRET inválido ou ausente.' });
  }

  try {
    const slotQuery = req.query.slot ? parseInt(req.query.slot as string, 10) : undefined;
    const slot = slotQuery && !isNaN(slotQuery) && slotQuery >= 1 && slotQuery <= 4
      ? slotQuery
      : inferSlotFromHour();

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
