import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sdyytxnmdquriqsxuvhd.supabase.co';
// Usa a chave JWT legada (anon) — necessária em Vercel Serverless (process.env)
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeXl0eG5tZHF1cmlxc3h1dmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQ4NDQsImV4cCI6MjEwMjEzMDg0NH0.5yJkOv41YkLvCc8goBjrHJZdzW_c8mUBlZ6gb9HvduI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const BASE_URL = 'https://eclesia.blog';
const SITE_NAME = 'Eclesia — Portal Editorial Católico';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const todayIso = new Date().toISOString().split('T')[0];
    const todayFull = new Date().toISOString();

    // 1. Busca artigos publicados com cover_image para Image Sitemap
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, title, published_at, created_at, cover_image, excerpt')
      .eq('status', 'publicado')
      .order('published_at', { ascending: false })
      .limit(500);

    // 2. Busca santos cadastrados
    const { data: saints } = await supabase
      .from('saints')
      .select('slug, id, name, created_at')
      .limit(365);

    // 3. Rotas fixas institucionais
    const staticRoutes = [
      { loc: `${BASE_URL}/`, lastmod: todayIso, changefreq: 'daily', priority: '1.0' },
      { loc: `${BASE_URL}/blog`, lastmod: todayIso, changefreq: 'daily', priority: '0.9' },
      { loc: `${BASE_URL}/liturgia`, lastmod: todayIso, changefreq: 'daily', priority: '0.9' },
      { loc: `${BASE_URL}/santoral`, lastmod: todayIso, changefreq: 'daily', priority: '0.9' },
      { loc: `${BASE_URL}/oracoes`, lastmod: todayIso, changefreq: 'weekly', priority: '0.8' },
      { loc: `${BASE_URL}/loja`, lastmod: todayIso, changefreq: 'weekly', priority: '0.8' },
      { loc: `${BASE_URL}/assinaturas`, lastmod: todayIso, changefreq: 'monthly', priority: '0.7' },
      { loc: `${BASE_URL}/termos`, lastmod: '2026-01-01', changefreq: 'yearly', priority: '0.3' },
      { loc: `${BASE_URL}/privacidade`, lastmod: '2026-01-01', changefreq: 'yearly', priority: '0.3' }
    ];

    // 4. Monta XML com namespaces completos: sitemap padrão + news + image + xhtml (hreflang)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;
    xml += ` xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"`;
    xml += ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`;
    xml += ` xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // Rotas estáticas com hreflang
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(route.loc)}</loc>\n`;
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(route.loc)}"/>\n`;
      xml += `  </url>\n`;
    }

    // Artigos dinâmicos: Google News Sitemap (48h) + Image Sitemap + hreflang
    if (articles && articles.length > 0) {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      for (const art of articles) {
        if (!art.slug) continue;
        const artDate = art.published_at
          ? new Date(art.published_at).toISOString().split('T')[0]
          : todayIso;
        const artDateFull = art.published_at
          ? new Date(art.published_at).toISOString()
          : todayFull;
        const artLoc = `${BASE_URL}/blog/${art.slug}`;
        const isRecent = art.published_at && new Date(art.published_at) > twoDaysAgo;

        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(artLoc)}</loc>\n`;
        xml += `    <lastmod>${artDate}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(artLoc)}"/>\n`;

        // Google News: apenas artigos publicados nas últimas 48h
        if (isRecent && art.title) {
          xml += `    <news:news>\n`;
          xml += `      <news:publication>\n`;
          xml += `        <news:name>${escapeXml(SITE_NAME)}</news:name>\n`;
          xml += `        <news:language>pt</news:language>\n`;
          xml += `      </news:publication>\n`;
          xml += `      <news:publication_date>${artDateFull}</news:publication_date>\n`;
          xml += `      <news:title>${escapeXml(art.title)}</news:title>\n`;
          xml += `    </news:news>\n`;
        }

        // Image Sitemap: cover_image se disponível
        if (art.cover_image) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${escapeXml(art.cover_image)}</image:loc>\n`;
          if (art.title) xml += `      <image:title>${escapeXml(art.title)}</image:title>\n`;
          if (art.excerpt) xml += `      <image:caption>${escapeXml(art.excerpt.slice(0, 100))}</image:caption>\n`;
          xml += `    </image:image>\n`;
        }

        xml += `  </url>\n`;
      }
    }

    // Santos dinâmicos com hreflang
    if (saints && saints.length > 0) {
      for (const saint of saints) {
        const identifier = saint.slug || saint.id;
        if (!identifier) continue;
        const saintLoc = `${BASE_URL}/santoral/${identifier}`;
        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(saintLoc)}</loc>\n`;
        xml += `    <lastmod>${todayIso}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(saintLoc)}"/>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache: 30min CDN; stale-while-revalidate de 4h
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=14400');
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('[Sitemap Generation Error]:', error);
    return res.status(500).send('Erro ao gerar sitemap dinâmico.');
  }
}
