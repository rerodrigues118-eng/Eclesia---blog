import { Essay } from '../types';

export interface SeoAuditResult {
  score: number; // 0 to 100
  status: 'excelente' | 'bom' | 'precisa_melhorar' | 'critico';
  checks: {
    label: string;
    passed: boolean;
    recommendation: string;
  }[];
}

/**
 * Generates an SEO friendly URL slug from an article title.
 * Removes accents, special chars, and formats lowercase hyphens.
 */
export function generateSeoSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non alphanumeric
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/-+/g, '-'); // remove duplicate -
}

/**
 * Extracts a concise, high-CTR meta description (around 140-155 chars) ending in a full sentence or period.
 */
export function generateSeoMetaDescription(content: string, fallbackExcerpt?: string): string {
  const text = (fallbackExcerpt || content || '')
    .replace(/<[^>]*>/g, '') // strip HTML
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= 155) return text;
  
  const truncated = text.slice(0, 150);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Analyzes an essay and computes its Google SEO score with recommendations.
 */
export function calculateSeoScore(essay: Partial<Essay>): SeoAuditResult {
  const checks: { label: string; passed: boolean; recommendation: string }[] = [];
  let passedCount = 0;
  const totalChecks = 6;

  // 1. Title Length (Best: 40 - 60 chars)
  const title = essay.metaTitle || essay.title || '';
  const titleLen = title.trim().length;
  const titlePassed = titleLen >= 30 && titleLen <= 65;
  if (titlePassed) passedCount++;
  checks.push({
    label: `Tamanho do Título SEO (${titleLen} caracteres)`,
    passed: titlePassed,
    recommendation: titlePassed
      ? 'Excelente! Título com tamanho ideal para não ser cortado no Google.'
      : titleLen < 30
      ? 'Título muito curto. Adicione detalhes ou palavras-chave (ideal: 40-60 caracteres).'
      : 'Título muito longo. O Google irá cortar com "..." nos resultados (ideal: máximo 60 caracteres).'
  });

  // 2. Meta Description Length (Best: 120 - 160 chars)
  const desc = essay.metaDescription || essay.excerpt || '';
  const descLen = desc.trim().length;
  const descPassed = descLen >= 90 && descLen <= 165;
  if (descPassed) passedCount++;
  checks.push({
    label: `Meta Description (${descLen} caracteres)`,
    passed: descPassed,
    recommendation: descPassed
      ? 'Excelente! Meta descrição atraente e com tamanho perfeito para a SERP.'
      : descLen < 90
      ? 'Meta descrição muito curta. Explique melhor o tema para atrair cliques (ideal: 120-160 caracteres).'
      : 'Meta descrição longa demais. Mantenha em até 160 caracteres.'
  });

  // 3. Slug / Friendly URL
  const slug = essay.slug || '';
  const slugPassed = slug.length >= 5 && /^[a-z0-9-]+$/.test(slug);
  if (slugPassed) passedCount++;
  checks.push({
    label: 'URL Amigável (Slug)',
    passed: slugPassed,
    recommendation: slugPassed
      ? 'URL limpa, sem caracteres especiais e otimizada para o Googlebot.'
      : 'Defina uma URL amigável curta (ex: a-graca-e-a-natureza).'
  });

  // 4. Content Word Count (Best: >= 250 words)
  const contentWords = (essay.content || '').trim().split(/\s+/).filter(Boolean).length;
  const contentPassed = contentWords >= 150;
  if (contentPassed) passedCount++;
  checks.push({
    label: `Extensão do Conteúdo (${contentWords} palavras)`,
    passed: contentPassed,
    recommendation: contentPassed
      ? 'Artigo com densidade adequada para indexação e autoridade temática.'
      : 'Conteúdo muito breve. Artigos com mais de 250 palavras têm melhor ranqueamento.'
  });

  // 5. Image & Alt Text
  const hasImage = Boolean(essay.imageUrl && essay.imageUrl.trim().length > 5);
  const hasAlt = Boolean(essay.altText && essay.altText.trim().length > 3);
  const imagePassed = hasImage && (hasAlt || essay.title);
  if (imagePassed) passedCount++;
  checks.push({
    label: 'Capa & Imagem com Texto Alternativo',
    passed: Boolean(hasImage),
    recommendation: hasImage
      ? 'Imagem de capa configurada para Open Graph e Google Imagens.'
      : 'Adicione uma imagem de capa de alta resolução.'
  });

  // 6. Keywords / Categorização
  const hasCategory = Boolean(essay.category && essay.category.trim().length > 0);
  const hasKeywords = Boolean(essay.keywords && essay.keywords.length > 0);
  const catPassed = hasCategory;
  if (catPassed) passedCount++;
  checks.push({
    label: 'Categoria & Palavras-chave Católicas',
    passed: catPassed,
    recommendation: catPassed
      ? `Categoria "${essay.category}" definida com sucesso.`
      : 'Defina a categoria teológica do artigo para breadcrumbs e indexação.'
  });

  const score = Math.round((passedCount / totalChecks) * 100);
  let status: SeoAuditResult['status'] = 'excelente';
  if (score < 50) status = 'critico';
  else if (score < 75) status = 'precisa_melhorar';
  else if (score < 90) status = 'bom';

  return { score, status, checks };
}

/**
 * Updates dynamic meta tags in document.head and injects Schema.org Article JSON-LD
 */
export function updateDocumentSeo(essay: Essay) {
  const siteName = 'Eclesia Editorial';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eclesia.com.br';
  const fullTitle = essay.metaTitle
    ? `${essay.metaTitle} | ${siteName}`
    : `${essay.title} | ${siteName}`;

  const description = essay.metaDescription || essay.excerpt || essay.title;
  const slug = essay.slug || generateSeoSlug(essay.title);
  const canonicalUrl = essay.canonicalUrl || `${baseUrl}/blog/${slug}`;
  const imageUrl = essay.ogImage || essay.imageUrl;

  // 1. Page Title
  document.title = fullTitle;

  // Helper to set or update meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta Tags
  setMeta('description', description);
  if (essay.keywords && essay.keywords.length > 0) {
    setMeta('keywords', essay.keywords.join(', '));
  }
  setMeta('author', essay.author);
  setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // 3. Open Graph (Facebook, WhatsApp, LinkedIn)
  setMeta('og:title', essay.title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:image', imageUrl, true);
  setMeta('og:type', 'article', true);
  setMeta('og:site_name', siteName, true);
  setMeta('og:locale', 'pt_BR', true);

  // 4. Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', essay.title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', imageUrl);

  // 5. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 6. Schema.org Structured Data (JSON-LD Article)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': essay.type === 'noticia' ? 'NewsArticle' : 'Article',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'headline': essay.title,
    'description': description,
    'image': [imageUrl],
    'datePublished': essay.date || new Date().toISOString(),
    'dateModified': new Date().toISOString(),
    'author': {
      '@type': 'Person',
      'name': essay.author || 'Redação Eclesia'
    },
    'publisher': {
      '@type': 'Organization',
      'name': siteName,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/icon.png`
      }
    },
    'articleSection': essay.category || 'Teologia',
    'inLanguage': 'pt-BR'
  };

  let scriptEl = document.getElementById('article-schema-jsonld') as HTMLScriptElement;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'article-schema-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLdData);
}

/**
 * Resets document title and SEO tags back to portal defaults
 */
export function resetPortalSeo() {
  document.title = 'Eclesia | Plataforma Editorial & Tradição Católica';
  
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    descEl.setAttribute('content', 'Portal católico de teologia, santoral, orações diárias, liturgia e curadoria de arte sacra.');
  }

  const scriptEl = document.getElementById('article-schema-jsonld');
  if (scriptEl) {
    scriptEl.remove();
  }
}
