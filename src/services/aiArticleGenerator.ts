// ============================================================================
// ECLESIA BLOG CATÓLICO - CLIENT-SIDE AI ARTICLE GENERATOR (HUMANIZADO + FOTOS)
// Geração editorial de alto impacto para juventude católica e SEO 100%
// ============================================================================

import { supabase } from '../lib/supabase/client';
import { parseJsonSeguro } from '../utils/jsonParser';

const getEnvKey = (key: string) => {
  const meta = import.meta as any;
  if (meta && meta.env && meta.env[key]) return meta.env[key];
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  return '';
};

export const getGrokApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('eclesia_grok_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return getEnvKey('VITE_GROK_API_KEY') || getEnvKey('GROK_API_KEY') || '';
};

export const getGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('eclesia_gemini_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return getEnvKey('VITE_GEMINI_API_KEY') || getEnvKey('GEMINI_API_KEY') || '';
};

export const GROK_API_KEY = getGrokApiKey();
export const GEMINI_API_KEY = getGeminiApiKey();

export const setGrokApiKey = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('eclesia_grok_key', key.trim());
  }
};

export const setGeminiApiKey = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('eclesia_gemini_key', key.trim());
  }
};

export interface GeneratedArticleResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  read_time: string;
  cover_image: string;
  secondary_image?: string;
  gallery_images?: string[];
  alt_text: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  trending: boolean;
}

// ============================================================================
// CATÁLOGO DE IMAGENS SACRAS DE ALTA DEFINIÇÃO (100% TESTADAS E ATIVAS)
// ============================================================================
export interface ParImagensSacras {
  capa: { url: string; alt: string };
  interna: { url: string; alt: string; legenda: string };
}

export const CATALOGO_IMAGENS_SACRAS: Record<string, ParImagensSacras> = {
  liturgia: {
    capa: {
      url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
      alt: 'Cálice Sagrado e Altar da Santa Missa em celebração eucarística'
    },
    interna: {
      url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
      alt: 'Vitral clássico de catedral com iluminação sagrada',
      legenda: 'A luz de Cristo que ilumina a Palavra e a celebração eucarística'
    }
  },
  santo: {
    capa: {
      url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
      alt: 'Pintura sacra clássica retratando a santidade e a fé viva'
    },
    interna: {
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200',
      alt: 'Capela histórica e recolhimento espiritual dos santos',
      legenda: 'O silêncio fecundo onde a alma se encontra com o Criador'
    }
  },
  tema_em_alta: {
    capa: {
      url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200',
      alt: 'Jovens católicos em oração, fraternidade e discipulado'
    },
    interna: {
      url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
      alt: 'Altar e nave de igreja histórica com sol radiante',
      legenda: 'A presença viva de Jesus que renova as forças da juventude'
    }
  },
  juventude: {
    capa: {
      url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200',
      alt: 'Juventude católica unida no seguimento de Cristo'
    },
    interna: {
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200',
      alt: 'Devoção mariana e o terço nas mãos dos jovens',
      legenda: 'Com Maria, a juventude aprende a dizer sim sem medo'
    }
  },
  eucaristia: {
    capa: {
      url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
      alt: 'Adoração ao Santíssimo Sacramento e celebração da Eucaristia'
    },
    interna: {
      url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
      alt: 'Bíblia sagrada aberta ao lado da cruz e velas acesas',
      legenda: 'A Palavra que alimenta e o Pão da Vida que sustenta'
    }
  }
};

// ============================================================================
// FORMATADOR E HIGIENIZADOR DE TEXTO (GARANTE QUEBRAS REAIS E ESPAÇAMENTO)
// ============================================================================
function formatarTextoMarkdown(texto: string): string {
  if (!texto) return '';

  let formatado = texto
    // 1. Converte qualquer sequência literal de \n em quebra de linha real
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    // 2. Garante espaçamento limpo antes de subtítulos ## e ###
    .replace(/([^\n])\n(#{2,4}\s)/g, '$1\n\n$2')
    // 3. Garante espaçamento limpo antes e depois de citações >
    .replace(/([^\n])\n(>\s)/g, '$1\n\n$2')
    // 4. Garante que o bloco devocional [ORACAO] fique isolado e destacado
    .replace(/\s*\[ORACAO(?::\s*([^\]]+))?\]\s*/gi, '\n\n[ORACAO:$1]\n')
    .replace(/\s*\[\/ORACAO\]\s*/gi, '\n[/ORACAO]\n\n')
    // 5. Remove múltiplos excessos de quebras de linha consecutivas
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return formatado;
}

// ============================================================================
// INSERÇÃO ORGÂNICA DA SEGUNDA IMAGEM NO MEIO DO ARTIGO
// ============================================================================
function posicionarSegundaImagemNoArtigo(conteudo: string, urlImagem: string, legenda: string): string {
  if (!conteudo || !urlImagem) return conteudo;

  // Se já contém imagem no markdown, mantém
  if (conteudo.includes('[img-') || conteudo.includes('![')) {
    return conteudo;
  }

  const tagImagem = `\n\n[img-centro: ${urlImagem} | 480px | ${legenda}]\n\n`;

  // Localiza os subtítulos ## no texto
  const indicesHeadings: number[] = [];
  const regex = /\n## /g;
  let match;
  while ((match = regex.exec(conteudo)) !== null) {
    indicesHeadings.push(match.index);
  }

  // Se tiver 2 ou mais subtítulos, insere antes do 2º ou 3º subtítulo
  if (indicesHeadings.length >= 2) {
    const pontoCorte = indicesHeadings.length >= 3 ? indicesHeadings[1] : indicesHeadings[0];
    return conteudo.slice(0, pontoCorte) + tagImagem + conteudo.slice(pontoCorte);
  }

  // Fallback: se não tiver múltiplos headings, insere no meio dos parágrafos
  const blocos = conteudo.split('\n\n');
  if (blocos.length >= 4) {
    const meio = Math.floor(blocos.length / 2);
    blocos.splice(meio, 0, tagImagem.trim());
    return blocos.join('\n\n');
  }

  return conteudo + tagImagem;
}

// ============================================================================
// AUXILIAR: Chamada Grok (xAI) ou Groq
// ============================================================================
async function chamarTextoIA(promptSistema: string, promptUsuario: string): Promise<string> {
  const apiKey = getGrokApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Grok não configurada.');
  }

  const isGroq = apiKey.startsWith('gsk_');
  
  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';

  // Modelos testados com suporte a 3500 tokens sem erro de OTPM
  const modelos = isGroq
    ? ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound']
    : ['grok-2-latest', 'grok-beta'];

  let lastError = '';

  for (const model of modelos) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: promptSistema + '\nATENÇÃO OBRIGATÓRIA: Responda APENAS com um objeto JSON estritamente válido, sem texto conversacional antes ou depois.' },
            { role: 'user', content: promptUsuario }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 3500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `(${isGroq ? 'Groq' : 'xAI'} ${response.status}): ${errorText}`;
        console.warn(`[IA Warning] Modelo ${model} falhou:`, errorText);
        continue;
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content ?? '';
      const jsonString = rawContent.trim();

      if (jsonString) return jsonString;
    } catch (e: any) {
      lastError = e.message;
      console.warn(`[IA Exception] Modelo ${model}:`, e);
    }
  }

  throw new Error(`Erro na API de Texto: ${lastError}`);
}

// ============================================================================
// GERADOR PRINCIPAL COM DIRETRIZES HUMANIZADAS E JOVENS
// ============================================================================
export async function generateArticleClientSide(
  tipo: 'liturgia' | 'tema_em_alta' | 'santo' = 'liturgia',
  imagemReferencia?: string
): Promise<GeneratedArticleResult> {
  let grokKey = getGrokApiKey();
  if (!grokKey) {
    const userInput = typeof window !== 'undefined'
      ? window.prompt('Para gerar artigos com IA no Eclesia, insira sua chave do Grok / Groq (ex: gsk_...):\n(Ela será salva com segurança no seu navegador)')
      : null;
    if (userInput && userInput.trim()) {
      setGrokApiKey(userInput.trim());
      grokKey = userInput.trim();
    } else {
      throw new Error('Chave de API do Grok não informada. Insira sua chave para gerar o artigo.');
    }
  }

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const diaNum = hoje.getDate();
  const mesNum = hoje.getMonth() + 1;
  const anoNum = hoje.getFullYear();

  const isTrending = tipo === 'tema_em_alta';

  const promptSistema = `Você é um jovem comunicador e teólogo católico apaixonado por Cristo, no estilo vivo, acolhedor e dinâmico de São João Paulo II, Carlo Acutis e Santa Teresinha falando diretamente com a juventude.

DIRETRIZES DE ESTILO HUMANIZADO E JOVEM:
1. NUNCA use linguagem burocrática, corporativa ou clichês de IA (PROIBIDO: "No cenário contemporâneo", "Nos dias de hoje", "Em suma", "Vale ressaltar", "É de suma importância", "Um farol de esperança", "Neste contexto", "Por conseguinte").
2. NUNCA invente encíclicas falsas ou santos fictícios. Fale sempre de realidades autênticas da Igreja Católica (o Evangelho, a força da Eucaristia, o confessionário, os santos reais, amizades verdadeiras, a batalha diária contra as tentações e as distrações das telas).
3. Tom caloroso, jovem e próximo: Fale como um irmão mais velho na fé, com perguntas sinceras, exemplos práticos do cotidiano e palavras que tocam a alma.
4. Mínimo de 650 a 850 palavras no artigo, organizado com subtítulos chamativos em '## ' e citações com '> '.
5. Conclua SEMPRE com uma oração católica sincera, jovem e orante no formato:
   [ORACAO: Oração do Jovem Cristão]
   Senhor Jesus Cristo...
   [/ORACAO]`;

  const regrasSeo = `
    CRITÉRIOS ESTRITOS DE SEO DO PAINEL ECLESIA (OBRIGATÓRIO 100% DE SCORE):
    - "titulo": Título magnético e direto com EXATAMENTE entre 38 e 63 caracteres.
    - "metaTitle": Título SEO com 45 a 60 caracteres.
    - "metaDescription": Resumo instigante com 125 a 155 caracteres (respeite a faixa 110-165!).
    - "slug": minúsculas, hifens e números (sem acentos).
    - "resumo": Excerpt para os cards com 120 a 160 caracteres.
  `;

  let promptUsuario = '';

  if (tipo === 'liturgia') {
    promptUsuario = `
      Escreva o Artigo Oficial da "Liturgia Diária de Hoje" (${dataFormatada}) com linguagem pastoral jovem e vibrante.
      Conecte a mensagem do Evangelho da Santa Missa de hoje aos desafios práticos da rotina do jovem católico (estudos, trabalho, oração, família).
      ${regrasSeo}

      ESTRUTURA DO CONTEÚDO:
      - Introdução calorosa que prenda a atenção e mostre a relevância da Palavra hoje.
      - ## O Evangelho de Hoje e o Chamado de Jesus (leitura e reflexão viva).
      - ## O que Cristo está Falando Diretamente ao Seu Coração? (aplicação prática).
      - ## O Desafio Prático para o Seu Dia (uma atitude concreta de caridade ou fé).
      - Citação de santo da Igreja usando "> ".
      - Bloco [ORACAO: Oração Litúrgica do Dia] ao final.

      Retorne APENAS um JSON válido no formato:
      {
        "titulo": "Liturgia de Hoje: O Chamado de Cristo (${diaNum}/${mesNum})",
        "slug": "liturgia-diaria-${diaNum}-${mesNum}-${anoNum}",
        "metaTitle": "Liturgia Diária: Evangelho de Hoje Comentado",
        "metaDescription": "Confira o Evangelho de hoje e uma reflexão jovem e viva para transformar seu dia com a fé católica.",
        "resumo": "A Palavra de Deus proclamada na Missa de hoje e conselhos práticos para a sua vida cristã.",
        "conteudo": "...",
        "categoria": "Liturgia Diária",
        "tempoLeitura": "5 min de leitura",
        "keywords": ["Liturgia Diária", "Evangelho do dia", "Santa Missa", "Vida de Oração", "Palavra de Deus"],
        "temaVisual": "liturgia",
        "altText": "Cálice Sagrado e Altar da Santa Missa em celebração eucarística"
      }
    `;
  } else if (tipo === 'santo') {
    promptUsuario = `
      Escreva o Artigo do Santo comemorado pela Igreja hoje (${dataFormatada}).
      Apresente o santo não como uma figura distante em um pedestal, mas como alguém de carne e osso que descobriu o segredo da santidade e nos ensina a ser santos hoje.
      ${regrasSeo}

      ESTRUTURA DO CONTEÚDO:
      - Introdução apaixonante sobre o Santo do Dia.
      - ## Quem Foi e o Seu Chamado à Santidade (história real e conversão).
      - ## As Grandes Batalhas e o Heroísmo da Fé (desafios vencidos pelo amor de Deus).
      - ## Lições para a Nossa Vida Hoje (o que podemos imitar na prática).
      - Citação do Santo usando "> ".
      - Bloco [ORACAO: Oração a São/Santa...] ao final.

      Retorne APENAS um JSON válido.
    `;
  } else {
    promptUsuario = `
      RADAR DE TENDÊNCIAS CATÓLICAS PARA A JUVENTUDE HOJE (${dataFormatada}):
      Escolha um tema católico real, profundo e vibrante que dialogue com os jovens de hoje.
      Exemplos de temas de alto impacto:
      - Carlo Acutis e as redes sociais: A santidade na era do feed e dos games
      - Batalha espiritual: Como vencer a preguiça e a distração na oração
      - O segredo da Confissão: Por que sair do confessionário com a alma leve
      - Namoro Santo e castidade: É possível viver amor autêntico hoje?
      - A Santa Missa não é chata: O que seus olhos não veem no altar
      - A Pequena Via de Santa Teresinha: A santidade nos pequenos gestos
      - Ansiedade e confiança: Como encontrar paz nos braços de Nossa Senhora

      Escolha o tema mais inspirador e escreva um artigo humano, instigante, bem-humorado e doutrinariamente seguro.
      ${regrasSeo}

      ESTRUTURA:
      - Introdução instigante que faça o leitor se identificar imediatamente.
      - 3 ou 4 subtítulos marcantes com "## ".
      - Citações de santos reais com "> ".
      - Bloco devocional [ORACAO: ...] ao final.

      Retorne APENAS um JSON válido.
    `;
  }

  const jsonStr = await chamarTextoIA(promptSistema, promptUsuario);
  const artigo = parseJsonSeguro(jsonStr);

  // Seleciona par de imagens de alta definição correspondente ao tema
  const temaChave = tipo === 'liturgia' 
    ? 'liturgia' 
    : tipo === 'santo' 
    ? 'santo' 
    : (artigo.categoria?.toLowerCase().includes('eucaristia') ? 'eucaristia' : 'tema_em_alta');

  const parPadrao = CATALOGO_IMAGENS_SACRAS[temaChave] || CATALOGO_IMAGENS_SACRAS['tema_em_alta'];

  let urlCapa = imagemReferencia || parPadrao.capa.url;
  let urlInterna = parPadrao.interna.url;
  let legendaInterna = parPadrao.interna.legenda;

  // Se for Santo, tenta reaproveitar a foto do banco se existir
  if (!imagemReferencia && (tipo === 'santo' || artigo.categoria === 'Santo do Dia')) {
    try {
      const { data: santo } = await supabase
        .from('saints')
        .select('image_url, name')
        .eq('feast_month', mesNum)
        .eq('feast_day', diaNum)
        .maybeSingle();

      if (santo?.image_url) {
        urlCapa = santo.image_url;
      }
    } catch (e) {
      console.warn('Consulta a saints ignorada:', e);
    }
  }

  // Higieniza o texto para garantir quebras reais e formatação impecável
  let conteudoTratado = formatarTextoMarkdown(artigo.conteudo || '');

  // Insere a segunda imagem organicamente no meio do artigo
  conteudoTratado = posicionarSegundaImagemNoArtigo(conteudoTratado, urlInterna, legendaInterna);

  return {
    title: (artigo.titulo || 'Reflexão Espiritual Eclesia').replace(/\n/g, ' ').trim(),
    slug: (artigo.slug || 'artigo-catolico').toLowerCase().replace(/[^a-z0-9-]/g, ''),
    excerpt: (artigo.resumo || 'Reflexão e espiritualidade no Blog Católico Eclesia.').replace(/\n/g, ' ').trim(),
    content: conteudoTratado,
    category: artigo.categoria || (tipo === 'liturgia' ? 'Liturgia Diária' : tipo === 'santo' ? 'Santo do Dia' : 'Juventude & Fé'),
    author_name: 'Redação Eclesia',
    read_time: artigo.tempoLeitura || '5 min de leitura',
    cover_image: urlCapa,
    secondary_image: urlInterna,
    gallery_images: [urlInterna],
    alt_text: artigo.altText || parPadrao.capa.alt,
    meta_title: (artigo.metaTitle || artigo.titulo || 'Blog Católico Eclesia').replace(/\n/g, ' ').trim(),
    meta_description: (artigo.metaDescription || artigo.resumo || 'Artigo católico no Portal Eclesia.').replace(/\n/g, ' ').trim(),
    keywords: artigo.keywords && artigo.keywords.length > 0 ? artigo.keywords : ['Fé Católica', 'Juventude', 'Espiritualidade', 'Portal Eclesia'],
    trending: isTrending
  };
}
