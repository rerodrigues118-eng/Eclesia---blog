/**
 * generate-sitemap.mjs
 * Gera um sitemap.xml canônico e atualizado no diretório public/
 * antes de cada build para garantir que o Cloudflare Pages / Vercel
 * sirvam o sitemap com todos os artigos e páginas institucionais em HTTPS.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { SERVICE_ROLE_KEY, SUPABASE_URL } from './env-helper.mjs';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

const BASE_URL = 'https://eclesia.blog';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function fetchFromSupabase(table, query) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      console.warn(`[generate-sitemap] Erro ao buscar ${table}: HTTP ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.warn(`[generate-sitemap] Falha ao consultar ${table}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('🗺️  Gerando sitemap.xml canônico...');
  const todayIso = new Date().toISOString().split('T')[0];

  // 1. Busca artigos publicados
  const articles = await fetchFromSupabase(
    'articles',
    'status=eq.publicado&select=slug,title,published_at,cover_image&order=published_at.desc&limit=500'
  );
  console.log(`  📄 Artigos encontrados: ${articles.length}`);

  // 2. Busca santos
  const saints = await fetchFromSupabase(
    'saints',
    'select=slug,id,name,feast_month,feast_day,updated_at&limit=365'
  );
  console.log(`  ⛪ Santos encontrados: ${saints.length}`);

  // 3. Rotas institucionais e canônicas (todas em HTTPS, sem trailing slash exceto raiz)
  const staticRoutes = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/liturgia`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/santoral`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/terco`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/oracoes`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/benfeitores`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/loja`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/assinaturas`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/termos`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${BASE_URL}/privacidade`, changefreq: 'yearly', priority: '0.3' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

  // Rotas estáticas
  for (const r of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${r.loc}</loc>\n`;
    xml += `    <lastmod>${todayIso}</lastmod>\n`;
    xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
    xml += `    <priority>${r.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${r.loc}"/>\n`;
    xml += `  </url>\n`;
  }

  // Artigos do Blog
  for (const a of articles) {
    if (!a.slug) continue;
    const loc = `${BASE_URL}/blog/${a.slug}`;
    const lastmod = a.published_at ? a.published_at.split('T')[0] : todayIso;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(loc)}"/>\n`;

    if (a.cover_image && a.cover_image.startsWith('http')) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(a.cover_image)}</image:loc>\n`;
      if (a.title) xml += `      <image:title>${escapeXml(a.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  // Santos
  for (const s of saints) {
    const slug = s.slug || s.id;
    if (!slug) continue;
    const loc = `${BASE_URL}/santoral/${slug}`;
    const lastmod = s.updated_at ? s.updated_at.split('T')[0] : todayIso;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(loc)}"/>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const outputPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');
  console.log(`  ✅ Sitemap gerado com sucesso em: ${outputPath}`);
}

main().catch(err => {
  console.error('[generate-sitemap] Erro fatal:', err);
});
