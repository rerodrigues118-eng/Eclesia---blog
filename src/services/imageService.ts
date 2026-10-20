// ============================================================================
// ECLESIA BLOG CATÓLICO - GERAÇÃO E SELEÇÃO DE IMAGENS DESTACADAS
// Estratégia de Imagem Dupla:
// Opção A: Geração por IA (DALL-E 3 / Flux Sacred Art) ou API Unsplash
// Opção B: Banco Sacro Curado de Fallback em Alta Resolução organizado por tags
// ============================================================================

const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  const meta = (typeof import.meta !== 'undefined' ? (import.meta as any) : null);
  if (meta && meta.env && meta.env[key]) {
    return meta.env[key] as string;
  }
  return '';
};

export interface CoverImageResult {
  url: string;
  alt: string;
  source: 'dall-e' | 'flux-ia' | 'unsplash-api' | 'acervo-sacro';
}

// ============================================================================
// OPÇÃO B: BANCO SACRO DE FALLBACK CURADO POR TAGS (100% ALTA DEFINIÇÃO)
// ============================================================================
export interface SacredImageEntry {
  url: string;
  alt: string;
  tags: string[];
}

export const BANCO_SACRO_FALLBACK: SacredImageEntry[] = [
  // Eucaristia & Santa Missa
  {
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
    alt: 'Cálice sagrado de ouro e altar da Santa Missa em celebração eucarística solene',
    tags: ['eucaristia', 'missa', 'sacramento', 'comunhao', 'altar', 'liturgia', 'vinho', 'pao']
  },
  {
    url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
    alt: 'Ostensório dourado com o Santíssimo Sacramento iluminado em catedral gótica',
    tags: ['eucaristia', 'adoracao', 'santissimo', 'hóstia', 'altar', 'silencio']
  },
  // Oração & Santo Terço
  {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
    alt: 'Santo Terço católico repousado sobre as mãos em oração e recolhimento',
    tags: ['oracao', 'terco', 'rosario', 'fe', 'recolhimento', 'espiritualidade', 'prece']
  },
  {
    url: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?auto=format&fit=crop&q=80&w=1200',
    alt: 'Velas acesas diante do altar em profunda prece e vigília espiritual',
    tags: ['oracao', 'vela', 'vigilia', 'luz', 'interioridade', 'penitencia']
  },
  // Nossa Senhora & Mariano
  {
    url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200',
    alt: 'Pintura sacra renascentista da Santíssima Virgem Maria com o Menino Jesus',
    tags: ['maria', 'virgem', 'nossa senhora', 'mae de deus', 'mariano', 'imaculada']
  },
  // Bíblia, Palavra & Doutrina
  {
    url: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200',
    alt: 'Bíblia Sagrada antiga aberta com páginas iluminadas pela luz do sol',
    tags: ['biblia', 'palavra', 'evangelho', 'leitura', 'escritura', 'doutrina', 'teologia']
  },
  {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200',
    alt: 'Páginas sagradas e manuscrito de teologia cristã clássica',
    tags: ['teologia', 'catecismo', 'estudo', 'patristica', 'tomas de aquino', 'agostinho']
  },
  // Igreja, Vaticano & Basílicas
  {
    url: 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
    alt: 'Cúpula monumental e nave principal de catedral católica histórica',
    tags: ['igreja', 'catedral', 'vaticano', 'basilica', 'roma', 'papa', 'arquitetura', 'templo']
  },
  {
    url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&q=80&w=1200',
    alt: 'Praça de São Pedro e Basílica Vaticana sob a luz do entardecer',
    tags: ['vaticano', 'papa', 'roma', 'santa se', 'igreja', 'bispos', 'cnbb']
  },
  // Vitral Sacro & Arte Sacra
  {
    url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
    alt: 'Vitral clássico de catedral com luz solar radiante iluminando as figuras sagradas',
    tags: ['vitral', 'arte', 'sagrado', 'luz', 'catedral', 'beleza', 'beleza sacra']
  },
  // Juventude, Carlo Acutis & Apologética
  {
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
    alt: 'Jovem em postura de oração fervorosa diante do sacrário em igreja silenciosa',
    tags: ['jovem', 'juventude', 'acutis', 'vocacao', 'fe', 'testemunho', 'santidade', 'apologetica']
  },
  // Santos & Mártires
  {
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
    alt: 'Imagem sacra venerável de santo da Igreja em contemplação espiritual',
    tags: ['santo', 'santoral', 'martir', 'doutor', 'vida dos santos', 'reliquia']
  }
];

/**
 * Seleciona a melhor imagem do banco de fallback com base em pontuação de tags
 */
export function selecionarDoBancoSacro(tema: string, categoria: string = ''): CoverImageResult {
  const busca = `${tema} ${categoria}`.toLowerCase();
  let melhorImagem = BANCO_SACRO_FALLBACK[0];
  let maiorPontuacao = -1;

  for (const item of BANCO_SACRO_FALLBACK) {
    let pontos = 0;
    for (const tag of item.tags) {
      if (busca.includes(tag)) {
        pontos += 3;
      }
    }
    if (pontos > maiorPontuacao) {
      maiorPontuacao = pontos;
      melhorImagem = item;
    }
  }

  return {
    url: melhorImagem.url,
    alt: melhorImagem.alt,
    source: 'acervo-sacro'
  };
}

/**
 * Monta o prompt de arte sacra católica para os modelos de IA
 */
export function construirPromptArteSacra(tema: string, categoria: string = ''): string {
  return `A reverent and stunning Catholic sacred art masterpiece depicting ${tema}, category ${categoria || 'Catholic Faith'}. Cinematic lighting, soft candle and stained-glass glow, high Renaissance and Baroque sacred painting aesthetic, hyperdetailed, 4k, oil painting on canvas texture, profound spiritual atmosphere, no text, no modern distortion.`;
}

/**
 * Tenta gerar imagem sacra via DALL-E 3 (OpenAI) se a chave estiver configurada
 */
async function tentarGerarDalle3(prompt: string): Promise<CoverImageResult | null> {
  const apiKey = getEnv('OPENAI_API_KEY');
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt.slice(0, 950),
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      const imageUrl = data.data?.[0]?.url;
      if (imageUrl) {
        return {
          url: imageUrl,
          alt: `Arte sacra gerada por IA: ${prompt.slice(0, 100)}`,
          source: 'dall-e'
        };
      }
    }
  } catch (err) {
    console.warn('[imageService] DALL-E 3 indisponível ou timeout:', err);
  }
  return null;
}

/**
 * Tenta gerar imagem sacra via Pollinations Flux (IA generativa gratuita com URL direta)
 */
function gerarUrlFluxArteSacra(tema: string, categoria: string): CoverImageResult {
  const cleanTema = tema
    .replace(/[^\w\s]/gi, '')
    .trim()
    .slice(0, 120);

  const promptEncoded = encodeURIComponent(
    `Catholic sacred art, ${cleanTema}, ${categoria || 'church'}, cinematic church lighting, stained glass, baroque masterpiece, 4k, religious painting`
  );

  const url = `https://image.pollinations.ai/prompt/${promptEncoded}?width=1200&height=675&nologo=true&model=flux`;

  return {
    url,
    alt: `Arte sacra católica: ${tema}`,
    source: 'flux-ia'
  };
}

/**
 * Função principal: obtém ou gera imagem de capa para qualquer conteúdo editorial
 * Estratégia Dupla:
 * 1. Tenta DALL-E 3 se chave configurada
 * 2. Tenta modelo Flux IA
 * 3. Fallback garantido para o Acervo Sacro de Alta Resolução por tags
 */
export async function obterImagemDestacada(
  tema: string,
  categoria: string = '',
  promptCustom?: string
): Promise<CoverImageResult> {
  const prompt = promptCustom || construirPromptArteSacra(tema, categoria);

  // 1. Tenta DALL-E 3 caso tenha OPENAI_API_KEY
  const dalleResult = await tentarGerarDalle3(prompt);
  if (dalleResult && dalleResult.url) {
    return dalleResult;
  }

  // 2. Se for tema com alta afinidade no acervo sacro curado (fotos reais de alta definição), prioriza o acervo
  const fallback = selecionarDoBancoSacro(tema, categoria);

  // Se o tema for muito específico ou notícia, fornece URL do gerador Flux ou banco
  if (fallback && fallback.url) {
    return fallback;
  }

  // 3. Fallback IA gerativo
  return gerarUrlFluxArteSacra(tema, categoria);
}
