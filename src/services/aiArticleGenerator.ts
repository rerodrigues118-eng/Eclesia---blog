// ============================================================================
// ECLESIA BLOG CATÓLICO - CLIENT-SIDE AI ARTICLE GENERATOR (GROK + IMAGEN 3)
// Fornece geração direta no frontend com fallback resiliente para Edge Function
// ============================================================================

import { supabase } from '../lib/supabase/client';

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
  alt_text: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  trending: boolean;
}

// ============================================================================
// AUXILIAR: Chamada Grok (xAI) ou Groq (Llama 3)
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

  const model = isGroq ? 'llama-3.3-70b-versatile' : 'grok-2-latest';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: promptSistema },
        { role: 'user', content: promptUsuario }
      ],
      temperature: 0.7,
      max_tokens: 3500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API de Texto (${isGroq ? 'Groq' : 'xAI'} ${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content ?? '';

  let jsonString = rawContent.trim();
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  }

  return jsonString;
}

// ============================================================================
// AUXILIAR: Geração de Arte Sacra com Google Imagen 3 (Gemini)
// ============================================================================
async function gerarImagemComImagen3(promptImagem: string, slug: string): Promise<string> {
  const geminiKey = getGeminiApiKey();
  if (!geminiKey) {
    return 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200';
  }

  try {
    const urlEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`;
    const promptSacro = `${promptImagem}, sacred Catholic religious art, neoclassical and baroque oil painting style, masterpiece, beautiful lighting, solemn and revered, 16:9 cinematic, hyper-detailed`;

    const response = await fetch(urlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey
      },
      body: JSON.stringify({
        instances: [{ prompt: promptSacro }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          outputOptions: { mimeType: 'image/jpeg' }
        }
      })
    });

    if (!response.ok) {
      console.warn('[Imagen 3 Warning]: Erro na resposta do Imagen 3:', response.status);
      return 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200';
    }

    const geminiData = await response.json();
    const base64Image = geminiData.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      return 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200';
    }

    // Decodifica Base64 para Uint8Array
    const binaryString = atob(base64Image);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    const nomeArquivo = `capas-ia/${Date.now()}-${slug.slice(0, 35)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(nomeArquivo, imageBytes, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.warn('[Storage Error] Não foi possível fazer upload para post-images:', uploadError);
      return `data:image/jpeg;base64,${base64Image}`;
    }

    const { data: publicUrlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(nomeArquivo);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('[Imagen 3 Fallback]', err);
    return 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200';
  }
}

// ============================================================================
// GERADOR PRINCIPAL (EXECUTA DIRETO NO CLIENTE COM REGRAS 100% SEO)
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

  const instrucoesSeoRigidas = `
    REGRAS INEGOCIÁVEIS DE SEO DO PAINEL ECLESIA (SEU ARTIGO SERÁ AUDITADO POR 8 CRITÉRIOS):
    1. "titulo": Título com EXATAMENTE entre 38 e 63 caracteres (ótimo para cliques no Google sem ser cortado).
    2. "metaTitle": Título alternativo com 45 a 60 caracteres.
    3. "metaDescription": Resumo instigante com EXATAMENTE entre 125 e 155 caracteres (respeite a faixa 110-165!).
    4. "slug": Somente letras minúsculas, números e hifens (sem acentos ou caracteres especiais).
    5. "conteudo": O artigo DEVE conter no mínimo 650 palavras. Formatação em Markdown obrigatória:
       - Comece com parágrafos introdutórios envolventes.
       - Utilize pelo menos 3 a 4 subtítulos Markdown no formato "## Nome do Tópico".
       - Inclua uma citação inspiradora de Santos ou Doutores da Igreja usando "> Texto da citação".
       - OBRIGATÓRIO: Inclua um bloco devocional exatamente no formato:
         [ORACAO]
         **Oração do Dia**
         (Texto solene da oração católica aqui para os fiéis rezarem)
         [/ORACAO]
    6. "resumo": Excerpt para os cards de 120 a 160 caracteres.
    7. "promptImagem": Descrição em inglês para arte sacra caso seja necessário gerar no Imagen 3.
    8. "altText": Texto alternativo de 15 a 50 caracteres descrevendo a pintura/imagem para o Google Imagens.
  `;

  const promptSistema = 'Você é o Teólogo e Redator Chefe do Blog Católico Eclesia, especialista em alta doutrina, fidelidade ao Magistério da Igreja e redação SEO número 1 no Google.';
  let promptUsuario = '';

  if (tipo === 'liturgia') {
    promptUsuario = `
      Escreva o Artigo de Blog Oficial da "Liturgia Diária de Hoje" (${dataFormatada}).
      ${instrucoesSeoRigidas}

      ESTRUTURA DO CONTEÚDO LITÚRGICO:
      - Introdução ao Tempo Litúrgico e cor litúrgica de hoje.
      - ## Primeira Leitura (livro bíblico, capítulo e reflexão).
      - ## Salmo Responsorial (com o refrão destacado).
      - ## Santo Evangelho (proclamação e mensagem central de Cristo).
      - ## Homilia e Aplicação Espiritual para a Vida Diária (profunda reflexão teológica pastoral).
      - Bloco [ORACAO] ao final.

      Retorne APENAS um JSON válido:
      {
        "titulo": "Liturgia Diária de Hoje: Evangelho e Homilia (${diaNum}/${mesNum})",
        "slug": "liturgia-diaria-${diaNum}-${mesNum}-${anoNum}",
        "metaTitle": "Liturgia Diária: Evangelho de Hoje e Homilia",
        "metaDescription": "Confira o Evangelho de hoje, leituras e homilia comentada da liturgia católica no Portal Eclesia.",
        "resumo": "Leituras da Santa Missa, Evangelho do dia e reflexão espiritual completa para a sua oração matinal.",
        "conteudo": "...",
        "categoria": "Liturgia Diária",
        "tempoLeitura": "5 min de leitura",
        "keywords": ["Liturgia Diária", "Evangelho do dia", "Santa Missa", "Homilia", "Leituras de hoje"],
        "promptImagem": "Holy Catholic liturgy, golden chalice, open Bible, stained glass window in cathedral, sacred art",
        "altText": "Liturgia Diária da Santa Missa e Evangelho de hoje"
      }
    `;
  } else if (tipo === 'santo') {
    promptUsuario = `
      Escreva o Artigo de Blog do "Santo do Dia de Hoje" (${dataFormatada}).
      ${instrucoesSeoRigidas}

      ESTRUTURA DO CONTEÚDO DO SANTO:
      - Quem é o Santo comemorado pela Igreja hoje (${dataFormatada})?
      - ## Origem Histórica e o Chamado à Santidade
      - ## Os Grandes Milagres e o Testemunho Heroico da Fé
      - ## Lições Espirituais para os Católicos de Hoje
      - Citação do Santo usando "> frase do santo"
      - Bloco [ORACAO] com a oração canônica tradicional pedindo a intercessão do santo.

      Retorne APENAS um JSON válido.
    `;
  } else {
    promptUsuario = `
      RADAR DE TENDÊNCIAS CATÓLICAS DO DIA (${dataFormatada}):
      Analise os temas em alta no mundo católico hoje (solenidades, memória litúrgica, dúvidas doutrinárias mais pesquisadas, ensinamentos de grandes santos ou encíclicas papais).
      Escolha o TEMA CATÓLICO DE MAIOR IMPACTO E BUSCA no momento e crie um Artigo de Blog Teológico completo, magnético e edificante.
      ${instrucoesSeoRigidas}

      ESTRUTURA DO ARTIGO:
      - Introdução magnética que prenda a atenção nos primeiros segundos.
      - Pelo menos 3 subtítulos com "## ".
      - Fundamentação bíblica e patrística.
      - Citação de Santos ou Doutores da Igreja usando "> ".
      - Bloco [ORACAO] devocional solene ao final.

      Retorne APENAS um JSON válido.
    `;
  }

  const jsonStr = await chamarTextoIA(promptSistema, promptUsuario);
  const artigo = JSON.parse(jsonStr);

  let urlCapa = imagemReferencia || '';

  // Reaproveitamento de imagem se for Santo
  if (!urlCapa && (tipo === 'santo' || artigo.categoria === 'Santo do Dia')) {
    try {
      const { data: santo } = await supabase
        .from('saints')
        .select('image_url')
        .eq('feast_month', mesNum)
        .eq('feast_day', diaNum)
        .maybeSingle();

      if (santo?.image_url) {
        urlCapa = santo.image_url;
      }
    } catch (e) {
      console.warn('Erro ao consultar santos no banco:', e);
    }
  }

  // Gera via Imagen 3 se não houver imagem prévia
  if (!urlCapa) {
    urlCapa = await gerarImagemComImagen3(artigo.promptImagem, artigo.slug);
  }

  return {
    title: artigo.titulo,
    slug: artigo.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    excerpt: artigo.resumo,
    content: artigo.conteudo,
    category: artigo.categoria || (tipo === 'liturgia' ? 'Liturgia Diária' : tipo === 'santo' ? 'Santo do Dia' : 'Teologia'),
    author_name: 'Redação Eclesia',
    read_time: artigo.tempoLeitura || '5 min de leitura',
    cover_image: urlCapa,
    alt_text: artigo.altText || artigo.titulo,
    meta_title: artigo.metaTitle || artigo.titulo,
    meta_description: artigo.metaDescription || artigo.resumo,
    keywords: artigo.keywords || [],
    trending: isTrending
  };
}
