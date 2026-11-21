// ============================================================================
// ECLESIA BLOG CATÓLICO - MONITOR DE FONTES CATÓLICAS OFICIAIS (RSS / NOTÍCIAS)
// Monitora: Vatican News (PT), ACI Digital, CNBB e Canção Nova Notícias
// ============================================================================

export interface CatholicTrend {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: 'Vatican News' | 'ACI Digital' | 'CNBB' | 'Canção Nova' | string;
  categorySuggested?: string;
}

interface FeedConfig {
  source: 'Vatican News' | 'ACI Digital' | 'CNBB' | 'Canção Nova';
  urls: string[];
}

const CATHOLIC_FEEDS: FeedConfig[] = [
  {
    source: 'Vatican News',
    urls: ['https://www.vaticannews.va/pt.rss.xml']
  },
  {
    source: 'ACI Digital',
    urls: [
      'https://www.acidigital.com/rss/rss.php',
      'https://feeds.feedburner.com/acidigital'
    ]
  },
  {
    source: 'CNBB',
    urls: ['https://www.cnbb.org.br/feed/']
  },
  {
    source: 'Canção Nova',
    urls: ['https://noticias.cancaonova.com/feed/']
  }
];

function extractCdata(str: string): string {
  if (!str) return '';
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function stripHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Faz parsing leve e resiliente de itens XML RSS sem dependências externas
 */
function parseRssXml(xml: string, sourceName: string): CatholicTrend[] {
  const items: CatholicTrend[] = [];
  const itemRegex = /<item(?:\s+[^>]*)?>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title(?:\s+[^>]*)?>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link(?:\s+[^>]*)?>([\s\S]*?)<\/link>/i);
    const descMatch =
      itemXml.match(/<description(?:\s+[^>]*)?>([\s\S]*?)<\/description>/i) ||
      itemXml.match(/<content:encoded(?:\s+[^>]*)?>([\s\S]*?)<\/content:encoded>/i);
    const pubDateMatch = itemXml.match(/<pubDate(?:\s+[^>]*)?>([\s\S]*?)<\/pubDate>/i);

    const rawTitle = titleMatch ? titleMatch[1] : '';
    const rawLink = linkMatch ? linkMatch[1] : '';
    const rawDesc = descMatch ? descMatch[1] : '';
    const rawPubDate = pubDateMatch ? pubDateMatch[1] : '';

    const title = stripHtml(extractCdata(rawTitle));
    const link = stripHtml(extractCdata(rawLink));
    const description = stripHtml(extractCdata(rawDesc));
    const pubDate = stripHtml(extractCdata(rawPubDate));

    if (title && title.length > 5) {
      items.push({
        title,
        link,
        description: description.slice(0, 350),
        pubDate,
        source: sourceName
      });
    }
  }

  return items;
}

/**
 * Busca notícias recentes de uma fonte com fallback de URLs e timeout
 */
async function fetchSourceWithFallback(feed: FeedConfig): Promise<CatholicTrend[]> {
  for (const url of feed.urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EclesiaBot/1.0 (+https://eclesia.blog)'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const text = await resp.text();
        const items = parseRssXml(text, feed.source);
        if (items.length > 0) {
          return items;
        }
      }
    } catch (err: any) {
      console.warn(`[fetchCatholicTrends] Falha ao consultar feed ${url}:`, err.message || err);
    }
  }
  return [];
}

/**
 * Coleta todas as tendências e notícias das 4 fontes católicas oficiais
 */
export async function fetchCatholicTrends(): Promise<CatholicTrend[]> {
  try {
    const results = await Promise.allSettled(
      CATHOLIC_FEEDS.map(feed => fetchSourceWithFallback(feed))
    );

    const allTrends: CatholicTrend[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        allTrends.push(...r.value);
      }
    }

    return allTrends;
  } catch (error) {
    console.error('[fetchCatholicTrends] Erro geral ao coletar feeds:', error);
    return [];
  }
}

/**
 * Pautas de contingência caso todos os feeds externos estejam indisponíveis
 */
const PAUTAS_FALLBACK: Record<number, CatholicTrend> = {
  1: {
    title: 'Santo do Dia: Vida, Martírio e Virtudes Heroicas para os Tempos de Hoje',
    link: 'https://eclesia.blog',
    description: 'A memória litúrgica dos santos da Igreja Católica, seu testemunho inabalável e lições práticas para a santidade diária.',
    pubDate: new Date().toISOString(),
    source: 'Santoral Romano',
    categorySuggested: 'Santo do Dia'
  },
  2: {
    title: 'Vaticano e Santa Sé: A Palavra do Papa e a Missão da Igreja Universal',
    link: 'https://eclesia.blog',
    description: 'Os pronunciamentos da Sé Apostólica sobre a paz, o valor inegociável da vida humana e a defesa dos vulneráveis.',
    pubDate: new Date().toISOString(),
    source: 'Vaticano News',
    categorySuggested: 'Vaticano'
  },
  3: {
    title: 'A Paz Interior na Era da Ansiedade: O Silêncio da Oração Diante do Cansaço Mental',
    link: 'https://eclesia.blog',
    description: 'Como a sabedoria milenar dos Padres da Igreja e a adoração eucarística curam a dispersão e a inquietação contemporânea.',
    pubDate: new Date().toISOString(),
    source: 'Tradição Espiritual da Igreja',
    categorySuggested: 'Espiritualidade'
  },
  4: {
    title: 'Juventude e Propósito: Pureza, Afetividade e Coragem Vocacional no Século XXI',
    link: 'https://eclesia.blog',
    description: 'O testemunho heroico dos jovens santos como Carlo Acutis e Pier Giorgio Frassati para vencer o vazio existencial.',
    pubDate: new Date().toISOString(),
    source: 'Pastoral Juvenil Católica',
    categorySuggested: 'Juventude'
  },
  5: {
    title: 'Igreja no Brasil: Ação Evangelizadora, Missão Paroquial e Defesa da Fé',
    link: 'https://eclesia.blog',
    description: 'A caminhada pastoral das dioceses brasileiras, iniciativas de caridade e o testemunho vibrante das comunidades católicas.',
    pubDate: new Date().toISOString(),
    source: 'CNBB & Canção Nova',
    categorySuggested: 'Igreja no Brasil'
  },
  6: {
    title: 'O Mistério da Cruz e a Graça do Perdão: Vencendo o Ressentimento e as Feridas da Alma',
    link: 'https://eclesia.blog',
    description: 'Como a reconciliação cristã e os sacramentos restauram relacionamentos e devolvem a esperança nos momentos de provação.',
    pubDate: new Date().toISOString(),
    source: 'Vida Interior & Teologia Moral',
    categorySuggested: 'Vida Interior'
  }
};

/**
 * Seleciona a melhor pauta católica com base no Slot do dia (1 a 6):
 * - Slot 1 (05:00 BRT): Santo do Dia (Santoral e mística)
 * - Slot 2 (07:30 BRT): Notícia 1 (Vaticano, Santa Sé, Papa)
 * - Slot 3 (10:30 BRT): Espiritualidade & Dores Contemporâneas 1 (Ansiedade, cansaço mental, redes)
 * - Slot 4 (13:30 BRT): Juventude, vocação, afetividade, amizades e fé no digital
 * - Slot 5 (16:30 BRT): Notícia 2 (Igreja no Brasil, CNBB, ação pastoral nacional)
 * - Slot 6 (19:30 BRT): Espiritualidade & Dores Contemporâneas 2 (Perdão, cura, reconciliação)
 */
export async function obterPautaDoSlot(slot: number = 1): Promise<CatholicTrend> {
  const trends = await fetchCatholicTrends();

  if (trends.length === 0) {
    return PAUTAS_FALLBACK[slot] || PAUTAS_FALLBACK[1];
  }

  // Palavras-chave temáticas por slot
  const filtrosSlot: Record<number, (t: CatholicTrend) => boolean> = {
    1: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return txt.includes('santo') || txt.includes('santoral') || txt.includes('beato') || txt.includes('festa') || txt.includes('memória');
    },
    2: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return t.source === 'Vatican News' || txt.includes('papa') || txt.includes('vatican') || txt.includes('santa sé') || txt.includes('roma');
    },
    3: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return (
        txt.includes('oração') ||
        txt.includes('oracao') ||
        txt.includes('espiritual') ||
        txt.includes('ansiedade') ||
        txt.includes('silêncio') ||
        txt.includes('recolhimento') ||
        txt.includes('paz') ||
        txt.includes('eucaristia')
      );
    },
    4: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return (
        txt.includes('jovem') ||
        txt.includes('juventude') ||
        txt.includes('vocação') ||
        txt.includes('vocacao') ||
        txt.includes('acutis') ||
        txt.includes('digital') ||
        txt.includes('namoro') ||
        txt.includes('estudante')
      );
    },
    5: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return t.source === 'CNBB' || t.source === 'Canção Nova' || txt.includes('brasil') || txt.includes('bispos') || txt.includes('paróquia') || txt.includes('diocese');
    },
    6: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return (
        txt.includes('perdão') ||
        txt.includes('perdao') ||
        txt.includes('misericórdia') ||
        txt.includes('luto') ||
        txt.includes('sofrimento') ||
        txt.includes('família') ||
        txt.includes('confissão') ||
        txt.includes('esperança')
      );
    }
  };

  const matcher = filtrosSlot[slot] || filtrosSlot[1];
  const candidato = trends.find(matcher);

  if (candidato) {
    return candidato;
  }

  // Se nenhum item bateu com as palavras-chave específicas, escolhe um item da fonte preferencial do slot
  if (slot === 2) {
    const vaticanItem = trends.find(t => t.source === 'Vatican News');
    if (vaticanItem) return vaticanItem;
  } else if (slot === 5) {
    const brasilItem = trends.find(t => t.source === 'CNBB' || t.source === 'Canção Nova');
    if (brasilItem) return brasilItem;
  }

  // Fallback para a primeira notícia disponível nos feeds
  return trends[0] || PAUTAS_FALLBACK[slot] || PAUTAS_FALLBACK[1];
}
