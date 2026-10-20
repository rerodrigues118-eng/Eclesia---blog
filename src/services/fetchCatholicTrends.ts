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
    title: 'A oração contínua e o combate da fé: Como rezar nos momentos de aflição',
    link: 'https://eclesia.blog',
    description: 'Aprofundamento sobre a vida de recolhimento, silêncio interior e o valor do Santo Terço na rotina do católico.',
    pubDate: new Date().toISOString(),
    source: 'Tradição Espiritual da Igreja',
    categorySuggested: 'Espiritualidade'
  },
  2: {
    title: 'A Presença Real de Cristo na Eucaristia: Mistério de Fé e Alimento de Salvação',
    link: 'https://eclesia.blog',
    description: 'Reflexão teológica sobre a transubstanciação segundo Santo Tomás de Aquino e o Catecismo da Igreja Católica.',
    pubDate: new Date().toISOString(),
    source: 'Magistério e Doutrina',
    categorySuggested: 'Teologia'
  },
  3: {
    title: 'Santidade Jovem no Século XXI: O Testemunho Heroico de Carlo Acutis e Pier Giorgio Frassati',
    link: 'https://eclesia.blog',
    description: 'Como os jovens católicos podem viver a pureza, o amor à Eucaristia e a coragem da evangelização no ambiente digital.',
    pubDate: new Date().toISOString(),
    source: 'Pastoral Juvenil Católica',
    categorySuggested: 'Juventude & Fé'
  },
  4: {
    title: 'A Missão Evangelizadora da Igreja no Mundo Contemporâneo e a Esperança Cristã',
    link: 'https://eclesia.blog',
    description: 'Os pronunciamentos da Sé Apostólica sobre a paz, o valor inegociável da vida humana e a defesa dos vulneráveis.',
    pubDate: new Date().toISOString(),
    source: 'Vaticano & Magistério',
    categorySuggested: 'Vaticano'
  }
};

/**
 * Seleciona a melhor pauta católica com base no Slot do dia:
 * - Slot 1 (06:00 BRT): Espiritualidade, oração, vida interior, adoração
 * - Slot 2 (10:30 BRT): Teologia, sacramentos, doutrina, Santo Tomás, patrística
 * - Slot 3 (15:00 BRT): Juventude, família, apologética, Carlo Acutis, santidade moderna
 * - Slot 4 (19:30 BRT): Notícias quentes do Vaticano, Papa, CNBB, acontecimentos globais da Igreja
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
      return (
        txt.includes('oração') ||
        txt.includes('oracao') ||
        txt.includes('espiritual') ||
        txt.includes('recolhimento') ||
        txt.includes('rosário') ||
        txt.includes('terço') ||
        txt.includes('nossa senhora') ||
        txt.includes('virgem') ||
        txt.includes('misericórdia') ||
        txt.includes('conversão')
      );
    },
    2: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return (
        txt.includes('eucaristia') ||
        txt.includes('missa') ||
        txt.includes('sacramento') ||
        txt.includes('teologia') ||
        txt.includes('doutrina') ||
        txt.includes('catecismo') ||
        txt.includes('liturgia') ||
        txt.includes('padres da igreja') ||
        txt.includes('evangelho')
      );
    },
    3: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return (
        txt.includes('jovem') ||
        txt.includes('juventude') ||
        txt.includes('família') ||
        txt.includes('familia') ||
        txt.includes('vida') ||
        txt.includes('acutis') ||
        txt.includes('vocação') ||
        txt.includes('vocacao') ||
        txt.includes('testemunho') ||
        txt.includes('apologética') ||
        txt.includes('apologetica')
      );
    },
    4: t => {
      const txt = `${t.title} ${t.description}`.toLowerCase();
      return (
        t.source === 'Vatican News' ||
        t.source === 'CNBB' ||
        txt.includes('papa') ||
        txt.includes('vaticano') ||
        txt.includes('santa sé') ||
        txt.includes('bispos') ||
        txt.includes('igreja') ||
        txt.includes('sínodo') ||
        txt.includes('paz')
      );
    }
  };

  const matcher = filtrosSlot[slot] || filtrosSlot[1];
  const candidato = trends.find(matcher);

  if (candidato) {
    return candidato;
  }

  // Se nenhum item bateu com as palavras-chave específicas, escolhe um item da fonte preferencial do slot
  if (slot === 4) {
    const vaticanItem = trends.find(t => t.source === 'Vatican News' || t.source === 'CNBB');
    if (vaticanItem) return vaticanItem;
  }

  // Fallback para a primeira notícia disponível nos feeds
  return trends[0] || PAUTAS_FALLBACK[slot] || PAUTAS_FALLBACK[1];
}
