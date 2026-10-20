import React, { useEffect } from 'react';
import { Essay, Saint, ActiveView } from '../types';

interface SEOHeadProps {
  activeView: ActiveView;
  selectedEssay?: Essay | null;
  selectedSaint?: Saint | null;
  liturgyData?: any | null;
}

const BASE_URL = 'https://eclesia.blog';
const SITE_NAME = 'Eclesia | Portal Editorial Católico';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200';

/**
 * Extrai pares de pergunta e resposta do markdown para gerar o FAQ Schema.org
 */
function extractFaqItemsFromMarkdown(content: string): { question: string; answer: string }[] {
  if (!content) return [];
  const items: { question: string; answer: string }[] = [];

  // Procura seções como "## Perguntas Frequentes" ou "### Dúvidas Frequentes"
  const faqSectionMatch = content.match(/(?:##|###)\s*(?:Perguntas Frequentes|Dúvidas Frequentes|FAQ)[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|(?:\[ORACAO)|$)/i);
  const textToScan = faqSectionMatch ? faqSectionMatch[1] : content;

  // Encontra padrões como "**Pergunta?** Resposta..." ou "### 1. Pergunta? Resposta..."
  const qaRegex = /(?:\*{2}|###\s*)([^?\n]+\?)(?:\*{2}|\n+)\s*([^\n#]+(?:\n[^\n#]+)*)/g;
  let match;
  while ((match = qaRegex.exec(textToScan)) !== null && items.length < 5) {
    const q = match[1].trim().replace(/^\d+\.\s*/, '');
    const a = match[2].trim().replace(/\n+/g, ' ');
    if (q.length > 8 && a.length > 15) {
      items.push({ question: q, answer: a });
    }
  }

  return items;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  activeView,
  selectedEssay,
  selectedSaint,
  liturgyData
}) => {
  useEffect(() => {
    let title = `${SITE_NAME} — Liturgia, Doutrina e Tradição`;
    let description = 'Portal editorial católico dedicado à transmissão fiel da fé, liturgia diária comentada, santoral, teologia, apologética e orações da Igreja Católica.';
    let canonicalUrl = `${BASE_URL}/`;
    let imageUrl = DEFAULT_IMAGE;
    let ogType = 'website';
    let keywords = ['Portal Eclesia', 'Igreja Católica', 'Fé Católica', 'Liturgia Diária', 'Santo do Dia', 'Teologia Católica'];
    const schemas: any[] = [];

    // Helper para definir tags meta no <head>
    const setMetaTag = (attr: 'name' | 'property', key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Helper para definir link canonical — NUNCA usa /home, normaliza trailing slash
    const setCanonical = (href: string) => {
      // Garante que a URL canônica nunca seja /home (causa do erro no Search Console)
      let normalizedHref = href
        .replace(/\/home\/?$/, '/')           // /home → /
        .replace(/([^/])\/+$/, '$1');          // remove trailing slash exceto na raiz
      // Garante protocolo correto
      if (!normalizedHref.startsWith('https://')) {
        normalizedHref = `${BASE_URL}${normalizedHref.startsWith('/') ? '' : '/'}${normalizedHref}`;
      }
      let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', normalizedHref);
    };

    const hoje = new Date();
    const dataExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // ─────────────────────────────────────────────────────────────────────────
    // 1. CASO: DETALHE DE ARTIGO DO BLOG (/blog/:slug)
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedEssay) {
      const artTitle = selectedEssay.metaTitle || selectedEssay.title;
      title = `${artTitle} | Eclesia`;
      description = selectedEssay.metaDescription || selectedEssay.excerpt || `Artigo completo sobre ${selectedEssay.title} no Portal Católico Eclesia.`;
      const slug = selectedEssay.slug || selectedEssay.id;
      canonicalUrl = `${BASE_URL}/blog/${slug}`;
      imageUrl = selectedEssay.ogImage || selectedEssay.imageUrl || DEFAULT_IMAGE;
      ogType = 'article';
      keywords = selectedEssay.keywords && selectedEssay.keywords.length > 0
        ? selectedEssay.keywords
        : ['Artigo Católico', selectedEssay.category || 'Teologia', 'Fé Católica'];

      // Schema: Article / BlogPosting
      schemas.push({
        '@context': 'https://schema.org',
        '@type': selectedEssay.type === 'noticia' ? 'NewsArticle' : 'BlogPosting',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        'headline': selectedEssay.title,
        'description': description,
        'image': [imageUrl],
        'datePublished': selectedEssay.date ? new Date().toISOString() : new Date().toISOString(),
        'dateModified': new Date().toISOString(),
        'author': {
          '@type': 'Person',
          'name': selectedEssay.author || 'Redação Eclesia',
          'url': `${BASE_URL}/blog`
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Eclesia Blog Católico',
          'logo': {
            '@type': 'ImageObject',
            'url': `${BASE_URL}/favicon.svg`
          }
        },
        'articleSection': selectedEssay.category || 'Teologia',
        'keywords': keywords.join(', '),
        'inLanguage': 'pt-BR'
      });

      // Schema: BreadcrumbList
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Início',
            'item': `${BASE_URL}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Blog',
            'item': `${BASE_URL}/blog`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': selectedEssay.title,
            'item': canonicalUrl
          }
        ]
      });

      // Schema: FAQPage (se houver dúvidas frequentes)
      const faqItems = extractFaqItemsFromMarkdown(selectedEssay.content);
      if (faqItems.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': faqItems.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer
            }
          }))
        });
      }
    } 
    // ─────────────────────────────────────────────────────────────────────────
    // 2. CASO: DETALHE DO SANTO DO DIA (/santoral/:id)
    // ─────────────────────────────────────────────────────────────────────────
    else if (selectedSaint) {
      title = `Santo do Dia: ${selectedSaint.name} — História, Oração e Frases | Eclesia`;
      description = selectedSaint.summary 
        ? `${selectedSaint.summary.slice(0, 150)}... Conheça a biografia completa e a oração no Portal Eclesia.`
        : `Conheça a história inspiradora, biografia e a oração oficial de ${selectedSaint.name}.`;
      canonicalUrl = `${BASE_URL}/santoral/${selectedSaint.id}`;
      imageUrl = selectedSaint.imageUrl || DEFAULT_IMAGE;
      ogType = 'profile';
      keywords = ['Santo do Dia', selectedSaint.name, 'Santoral Católico', 'Vida dos Santos', 'Oração dos Santos'];

      // Schema: Person
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': selectedSaint.name,
        'description': selectedSaint.summary || selectedSaint.fullBio?.slice(0, 200),
        'image': imageUrl,
        'jobTitle': selectedSaint.title || 'Santo da Igreja Católica',
        'knowsAbout': selectedSaint.patronage ? `Padroeiro: ${selectedSaint.patronage}` : 'Fé Católica',
        'url': canonicalUrl
      });

      // Schema: BreadcrumbList
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Santoral', 'item': `${BASE_URL}/santoral` },
          { '@type': 'ListItem', 'position': 3, 'name': selectedSaint.name, 'item': canonicalUrl }
        ]
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 3. CASO: LITURGIA DA PALAVRA (/liturgia)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeView === 'liturgia') {
      title = `Liturgia Diária de Hoje (${dataExtenso}): Leituras e Evangelho da Santa Missa | Eclesia`;
      description = `Confira a Liturgia Diária de hoje (${dataExtenso}): Primeira Leitura, Salmo responsorial, Proclamação do Evangelho da Santa Missa e reflexão homilética no Portal Eclesia.`;
      canonicalUrl = `${BASE_URL}/liturgia`;
      keywords = ['Liturgia Diária de hoje', 'Evangelho de hoje', 'Santa Missa', 'Tempo Comum', 'Primeira Leitura', 'Salmo do dia'];

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `Liturgia Diária da Santa Missa — ${dataExtenso}`,
        'description': description,
        'image': [imageUrl],
        'datePublished': hoje.toISOString().split('T')[0],
        'inLanguage': 'pt-BR',
        'publisher': {
          '@type': 'Organization',
          'name': 'Eclesia Blog Católico',
          'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/favicon.svg` }
        }
      });

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Liturgia Diária', 'item': canonicalUrl }
        ]
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 4. CASO: SANTORAL GERAL (/santoral)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeView === 'santoral') {
      title = `Santoral Católico e Santo do Dia | Eclesia`;
      description = 'Consulte o Santoral da Igreja Católica: biografias inspiradoras, histórias de fé, martírios, virtudes e orações de todos os santos do calendário católico.';
      canonicalUrl = `${BASE_URL}/santoral`;
      keywords = ['Santoral Católico', 'Santo do Dia', 'Vida dos Santos', 'Calendário Litúrgico'];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 5. CASO: BLOG GERAL (/blog)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeView === 'blog') {
      title = `Blog Católico: Artigos, Teologia, Vaticano e Espiritualidade | Eclesia`;
      description = 'Artigos teológicos, ensaios formativos, história da Igreja, atualidades do Vaticano e espiritualidade cristã para o leitor católico.';
      canonicalUrl = `${BASE_URL}/blog`;
      keywords = ['Blog Católico', 'Artigos de Fé', 'Teologia Católica', 'Notícias do Vaticano'];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 6. CASO: ORAÇÕES (/oracoes)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeView === 'oracoes') {
      title = `Orações Católicas Tradicionais e por Intenções | Eclesia`;
      description = 'Acervo de orações católicas para todas as situações da vida: oração da manhã, terço, novenas, orações de proteção, cura e libertação.';
      canonicalUrl = `${BASE_URL}/oracoes`;
      keywords = ['Orações Católicas', 'Oração da Manhã', 'Santo Terço', 'Novenas Católicas'];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 7. CASO: SANTO TERÇO INTERATIVO (/terco)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeView === 'terco') {
      title = `Santo Terço Interativo com Mistérios Automáticos | Eclesia`;
      description = 'Reze o Santo Terço católico online passo a passo: seleção automática dos mistérios do dia (Gozosos, Dolorosos, Gloriosos, Luminosos), contador de Ave-Marias e meditações.';
      canonicalUrl = `${BASE_URL}/terco`;
      keywords = ['Santo Terço', 'Terço Interativo', 'Mistérios do Terço', 'Rezar o Terço Online', 'Mistérios Gozosos', 'Mistérios Dolorosos', 'Mistérios Gloriosos', 'Mistérios Luminosos'];
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Santo Terço Interativo', 'item': canonicalUrl }
        ]
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 8. CASO: CLUBE DE BENFEITORES (/benfeitores)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeView === 'benfeitores') {
      title = `Clube de Benfeitores do Eclesia: Apoie o Apostolado Católico Digital`;
      description = 'Torne-se um benfeitor mensal do Eclesia e ajude a manter a evangelização católica, a formação doutrinária e as publicações diárias no ar.';
      canonicalUrl = `${BASE_URL}/benfeitores`;
      keywords = ['Benfeitores Eclesia', 'Apoio Apostolado Católico', 'Doação Católica', 'Evangelização Digital'];
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Benfeitores do Eclesia', 'item': canonicalUrl }
        ]
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 9. CASO: HOME & GLOBAL
    // ─────────────────────────────────────────────────────────────────────────
    else {
      title = 'Eclesia | Portal Editorial Católico, Liturgia Diária e Doutrina';
      description = 'Portal católico com liturgia diária comentada, santo do dia, ensaios teológicos, orações e atualidades da Santa Sé com fidelidade à doutrina da Igreja.';
      canonicalUrl = `${BASE_URL}/`;

      // Schema: WebSite com SearchAction (Sitelinks Searchbox no Google)
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Eclesia Blog Católico',
        'url': BASE_URL,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${BASE_URL}/blog?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });

      // Schema: Organization
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Eclesia Editorial',
        'url': BASE_URL,
        'logo': `${BASE_URL}/favicon.svg`,
        'description': 'Portal editorial católico dedicado à transmissão da fé, liturgia diária e doutrina.',
        'sameAs': [
          'https://instagram.com/eclesia.blog',
          'https://facebook.com/eclesia.blog'
        ]
      });
    }

    // Aplica no DOM
    document.title = title;
    setCanonical(canonicalUrl);
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords.join(', '));
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Eclesia');
    setMetaTag('property', 'og:locale', 'pt_BR');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageUrl);

    // Injeção de Structured Data (Schema.org JSON-LD)
    const existingScript = document.getElementById('dynamic-seo-schema');
    if (existingScript) existingScript.remove();

    if (schemas.length > 0) {
      const script = document.createElement('script');
      script.id = 'dynamic-seo-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
      document.head.appendChild(script);
    }
  }, [activeView, selectedEssay, selectedSaint, liturgyData]);

  return null;
};
