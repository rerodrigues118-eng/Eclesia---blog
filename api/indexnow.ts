import type { VercelRequest, VercelResponse } from '@vercel/node';
import { submitToIndexNow, pingSearchEnginesSitemap, SITE_URL } from '../../src/services/seoIndexing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const urlsParam = req.body?.urls || req.query.urls;
    let urlList: string[] = [];

    if (Array.isArray(urlsParam)) {
      urlList = urlsParam;
    } else if (typeof urlsParam === 'string') {
      urlList = urlsParam.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      urlList = [
        `${SITE_URL}/`,
        `${SITE_URL}/blog`,
        `${SITE_URL}/liturgia`,
        `${SITE_URL}/santoral`,
        `${SITE_URL}/sitemap.xml`
      ];
    }

    const indexNowResult = await submitToIndexNow(urlList);
    await pingSearchEnginesSitemap();

    return res.status(200).json({
      success: true,
      notifiedUrls: urlList,
      indexNow: indexNowResult,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[API IndexNow Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro ao processar envio IndexNow'
    });
  }
}
