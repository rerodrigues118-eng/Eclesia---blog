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
 * Extracts a concise, high-CTR meta description (around 130-155 chars) ending in a full sentence or period.
 */
export function generateSeoMetaDescription(content: string, fallbackExcerpt?: string): string {
  const text = (fallbackExcerpt || content || '')
    .replace(/\[\/?(oracao|citacao_biblica|anuncio|adsense|img-[^\]]+)[^\]]*\]/gi, '') // strip custom tags
    .replace(/#+\s*/g, '') // strip markdown headings
    .replace(/[*_`>]/g, '') // strip formatting
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= 155 && text.length >= 100) return text;
  
  if (text.length > 155) {
    const truncated = text.slice(0, 150);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated) + '...';
  }

  // If text is short, create a rich editorial description
  return text ? `${text} Confira esta reflexão teológica e formativa completa no Portal Eclesia.` : 'Reflexão católica profunda, teologia, tradição e oração no Portal Eclesia.';
}

/**
 * Smart Generator: Crafts complete SEO Package with 1-click
 */
export function generateSmartSeoPackage(title: string, content: string, category: string) {
  const cleanTitle = title.trim();
  const slug = generateSeoSlug(cleanTitle);
  const metaDescription = generateSeoMetaDescription(content);
  
  // High CTR Meta Title (adds site suffix if short)
  let metaTitle = cleanTitle;
  if (metaTitle.length < 40 && cleanTitle.length > 0) {
    metaTitle = `${cleanTitle} | Teologia & Fé Católica`;
  }

  // Generate relevant Catholic keywords
  const categoryKeywords: Record<string, string[]> = {
    'Teologia': ['Teologia Católica', 'Doutrina da Igreja', 'Santo Tomás de Aquino', 'Magistério'],
    'Liturgia': ['Liturgia Diária', 'Santa Missa', 'Tempo Litúrgico', 'Orações Católicas'],
    'Santoral': ['Santo do Dia', 'Vida dos Santos', 'Intercessão', 'Espiritualidade'],
    'História': ['História da Igreja', 'Patrística', 'Tradição Católica', 'Igreja Primitiva'],
    'Filosofia': ['Filosofia Cristã', 'Escolástica', 'Ética Cristã', 'Santo Agostinho'],
    'Notícia': ['Igreja Católica', 'Vaticano', 'Papa', 'Notícias Católicas']
  };

  const keywords = [
    cleanTitle,
    category || 'Teologia',
    ...(categoryKeywords[category] || ['Catolicismo', 'Fé Católica', 'Portal Eclesia'])
  ].slice(0, 6);

  return {
    slug,
    metaTitle,
    metaDescription,
    keywords
  };
}

/**
 * Analyzes an essay and computes its Google SEO score with 8 quality checks.
 * Aligned with Google Search Quality Rater & Adcash/AdSense editorial standards.
 */
export function calculateSeoScore(essay: Partial<Essay>): SeoAuditResult {
  const checks: { label: string; passed: boolean; recommendation: string }[] = [];
  let passedCount = 0;
  const totalChecks = 8;

  // 1. Title Length (Best: 35 - 65 chars)
  const title = essay.metaTitle || essay.title || '';
  const titleLen = title.trim().length;
  const titlePassed = titleLen >= 35 && titleLen <= 65;
  if (titlePassed) passedCount++;
  checks.push({
    label: `Tamanho do Título SEO (${titleLen}/65 caracteres)`,
    passed: titlePassed,
    recommendation: titlePassed
      ? 'Excelente! Título com tamanho ideal para alta taxa de cliques no Google.'
      : titleLen < 35
      ? 'Título muito curto. Adicione detalhes ou palavras-chave (ideal: 35-65 caracteres).'
      : 'Título muito longo. O Google cortará nos resultados (ideal: máximo 65 caracteres).'
  });

  // 2. Meta Description Length (Best: 110 - 165 chars)
  const desc = essay.metaDescription || essay.excerpt || '';
  const descLen = desc.trim().length;
  const descPassed = descLen >= 110 && descLen <= 165;
  if (descPassed) passedCount++;
  checks.push({
    label: `Meta Description (${descLen}/160 caracteres)`,
    passed: descPassed,
    recommendation: descPassed
      ? 'Excelente! Meta descrição atraente e com tamanho perfeito para a SERP.'
      : descLen < 110
      ? 'Meta descrição muito curta. Explique o tema para atrair cliques (ideal: 120-160 caracteres).'
      : 'Meta descrição longa demais. Mantenha em até 160 caracteres para não truncar.'
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
      : 'Defina uma URL amigável curta em minúsculas (ex: a-teologia-do-amor).'
  });

  // 4. Content Word Count (Adcash/Google standard: >= 400 words)
  const contentText = (essay.content || '').replace(/<[^>]*>/g, '').trim();
  const contentWords = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
  const contentPassed = contentWords >= 400;
  if (contentPassed) passedCount++;
  checks.push({
    label: `Extensão do Artigo (${contentWords} palavras)`,
    passed: contentPassed,
    recommendation: contentPassed
      ? 'Excelente! Artigo profundo com mais de 400 palavras (autoridade para redes de anúncios).'
      : contentWords < 200
      ? 'Conteúdo fino (Thin Content). Redes de anúncios rejeitam artigos curtos. Escreva pelo menos 400 palavras.'
      : 'Bom, mas recomendamos expandir para 400+ palavras para garantir aprovação no Adcash/Google.'
  });

  // 5. Subheadings Structure (H2 / H3 headers)
  const hasSubheadings = /##\s+[^\n]+/m.test(essay.content || '');
  if (hasSubheadings) passedCount++;
  checks.push({
    label: 'Estrutura de Subtítulos (H2 / H3)',
    passed: hasSubheadings,
    recommendation: hasSubheadings
      ? 'Excelente! Subtítulos ## organizam a leitura e enriquecem a indexação temática.'
      : 'Adicione pelo menos 2 subtítulos "## Nome do Tópico" para estruturar a leitura.'
  });

  // 6. Image & Alt Text
  const hasImage = Boolean(essay.imageUrl && essay.imageUrl.trim().length > 5);
  const hasAlt = Boolean((essay.altText && essay.altText.trim().length > 3) || (essay.title && essay.title.length > 5));
  const imagePassed = hasImage && hasAlt;
  if (imagePassed) passedCount++;
  checks.push({
    label: 'Capa & Imagem com Alt Text',
    passed: imagePassed,
    recommendation: imagePassed
      ? 'Imagem de capa configurada com texto alternativo para Open Graph e Google Imagens.'
      : 'Adicione uma imagem de capa de alta resolução para compartilhamento social.'
  });

  // 7. Devotional / Religious Enrichment Elements
  const hasEnrichment = /\[(oracao|citacao_biblica)[^\]]*\]/i.test(essay.content || '') || />\s+[^\n]+/.test(essay.content || '');
  if (hasEnrichment) passedCount++;
  checks.push({
    label: 'Elementos Devocionais (Oração / Citação)',
    passed: hasEnrichment,
    recommendation: hasEnrichment
      ? 'Artigo enriquecido com orações [ORACAO], citações bíblicas ou reflexões dos Santos.'
      : 'Inclua um bloco [ORACAO] ou citação de Santo "> texto" para engajar o leitor católico.'
  });

  // 8. Keywords & Categorização
  const hasCategory = Boolean(essay.category && essay.category.trim().length > 0);
  if (hasCategory) passedCount++;
  checks.push({
    label: 'Categoria Teológica',
    passed: hasCategory,
    recommendation: hasCategory
      ? `Categoria "${essay.category}" definida para taxonomia e breadcrumbs.`
      : 'Selecione a categoria teológica do artigo.'
  });

  const score = Math.round((passedCount / totalChecks) * 100);
  let status: SeoAuditResult['status'] = 'excelente';
  if (score < 50) status = 'critico';
  else if (score < 75) status = 'precisa_melhorar';
  else if (score < 90) status = 'bom';

  return { score, status, checks };
}

/**
 * Modelos Editoriais Católicos com Alta Otimização de SEO (600+ palavras)
 */
export const CATHOLIC_EDITORIAL_TEMPLATES = [
  {
    id: 'doutrina',
    title: 'Doutrina & Teologia Sistemática',
    description: 'Estrutura completa com introdução, magistério, ensinamentos patrísticos e oração.',
    content: `Aprofundar os mistérios da fé católica é um chamado para todo cristão que busca amar a Deus não apenas com o coração, mas também com a inteligência. Como nos ensina a tradição da Igreja, a graça não destrói a natureza, mas a eleva e aperfeiçoa.

## Os Fundamentos nas Sagradas Escrituras

Desde o Antigo Testamento até a plenitude da Revelação em Nosso Senhor Jesus Cristo, a verdade divina nos é comunicada com clareza salvífica. A Palavra de Deus é lâmpada para os nossos passos e luz para o nosso caminho.

[citacao_biblica: Evangelho de São João 8, 31-32]
Se permanecerdes na minha palavra, sereis verdadeiramente meus discípulos; e conhecereis a verdade, e a verdade vos libertará.
[/citacao_biblica]

Ao meditarmos nesta passagem, percebemos que a liberdade autêntica é inseparável do conhecimento e da obediência à vontade divina. O homem contemporâneo muitas vezes confunde liberdade com mera espontaneidade de impulsos, esquecendo que o pecado escraviza e a verdade liberta.

## O Ensinamento dos Padres da Igreja e do Magistério

Os Santos Padres da Igreja sempre destacaram a harmonia inabalável entre fé e razão. Santo Agostinho de Hipona expressou essa união com a célebre máxima: "Crê para compreender, e compreende para crer".

> "A fé e a razão são como duas asas pelas quais o espírito humano se eleva para a contemplação da verdade." — São João Paulo II

A Igreja Católica, como coluna e sustentáculo da verdade, preservou esse depósito imaculado ao longo de dois milênios, guiando os fiéis em meio às tempestades históricas e culturais de cada época.

## Aplicação Prática na Vida Espiritual Cotidiana

Conhecer a sã doutrina não deve ser um exercício meramente acadêmico ou intelectual; deve transformar nossas escolhas diárias, nossa vida de oração e nosso amor ao próximo. Para vivermos esta verdade hoje, somos chamados a:

1. **Frequência aos Sacramentos:** Especialmente a Santa Eucaristia e a Confissão regular.
2. **Vida de Oração Diária:** Momentos dedicados de silêncio, terço e meditação das Escrituras.
3. **Prática da Caridade:** Obras de misericórdia corporais e espirituais em nossa comunidade.

[oracao: Oração pela Fidelidade à Fé]
Senhor Jesus Cristo, Caminho, Verdade e Vida, concedei-nos a graça de permanecer firmes na santa fé católica. Iluminai nosso intelecto com a luz do vosso Santo Espírito e inflamai nossa vontade no vosso divino amor, para que possamos testemunhar vossa verdade em todos os momentos de nossa existência. Amém.
[/oracao]

---

Concluímos recordando que a santidade é a meta universal de todos os batizados. Que a Virgem Maria, Mãe da Igreja e Sede da Sabedoria, interceda por nós para que guardemos a fé com fidelidade inabalável até o fim de nossos dias.`
  },
  {
    id: 'santo',
    title: 'Vida & Exemplo dos Santos (Hagiografia)',
    description: 'Modelo biográfico hagiográfico de alto valor formativo e devocional.',
    content: `A vida dos santos constitui o Evangelho vivido e encarnado na história. Olhar para a trajetória daqueles que nos precederam na glória celeste é encontrar um farol seguro de esperança e um convite vigoroso à conversão pessoal.

## Origem, Vocação e os Primeiros Anos

Nascido em tempos de grandes desafios e transformações, este servo de Deus compreendeu desde a juventude que as honras passageiras deste mundo não podem saciar a sede infinita da alma humana, criada para Deus.

Em meio às tentações e pressões do ambiente, sua resposta ao chamado divino foi caracterizada por uma entrega generosa e incondicional. A vocação floresceu no solo fértil da oração fervorosa e do desapego dos bens temporais.

## O Heroísmo das Virtudes e o Combate Espiritual

A santidade não é ausência de lutas, mas a vitória da graça de Deus sobre a fraqueza humana. O testemunho deste santo destacou-se especialmente pelo exercício heroico das virtudes cardeais e teologais:

* **Fé inabalável:** Mesmo nos períodos de escuridão espiritual e perseguição.
* **Humildade sincera:** Reconhecendo-se como mero instrumento nas mãos da Providência.
* **Caridade ardente:** Dedicação incansável aos doentes, pobres e necessitados.

> "Nada te perturbe, nada te espante, tudo passa, Deus não muda. A paciência tudo alcança; quem a Deus tem, nada lhe falta: só Deus basta." — Santa Teresa d'Ávila

## Ensinamentos Eternos para o Cristão de Hoje

O exemplo que nos foi legado permanece vivo e plenamente atual. Diante do relativismo e do secularismo de nossos dias, os santos nos ensinam que a fidelidade a Cristo vale mais do que qualquer aprovação mundana.

[oracao: Oração de Intercessão]
Ó Deus todo-poderoso e eterno, que manifestais a vossa glória na vida dos vossos Santos, concedei-nos, por sua valiosa intercessão, a força para superar as provações terrenas e a graça de crescer no vosso santo amor a cada dia. Por Cristo, nosso Senhor. Amém.
[/oracao]

---

Que este exemplo luminoso de vida cristã nos inspire a buscar a santidade não amanhã, mas hoje, no cumprimento fiel de nossos deveres ordinários com extraordinário amor a Deus.`
  }
];

/**
 * Updates dynamic meta tags in document.head and injects Schema.org Article JSON-LD
 */
export function updateDocumentSeo(essay: Essay) {
  const siteName = 'Eclesia Editorial';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eclesia.blog';
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
        'url': `${baseUrl}/favicon.svg`
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
  document.title = 'Eclesia | Portal Editorial Católico, Liturgia e Devoção';
  
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    descEl.setAttribute('content', 'Reflexões teológicas profundas, liturgia diária completa, santoral com biografias de santos, orações por situação de vida e artigos religiosos.');
  }

  const scriptEl = document.getElementById('article-schema-jsonld');
  if (scriptEl) {
    scriptEl.remove();
  }
}
