// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR ARTIGO DIÁRIO COM IA
// Integração: Groq / Grok + Notícias Católicas RSS + Curadoria Sacra 100% Autêntica
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers CORS para permitir requisições do painel ERP Eclesia e disparadores externos
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

// Configuração de ambiente e segredos
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GROK_API_KEY = Deno.env.get("GROK_API_KEY") ?? "";

// Cliente Supabase administrativo com Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RequestPayload {
  tipo?: "artigo_slot_1" | "artigo_slot_2" | "artigo_slot_3" | "artigo_slot_4" | "noticia" | "teologia" | "espiritualidade" | "vaticano" | "santo" | "liturgia" | "manual";
  slot?: number; // 1 (06:00 BRT), 2 (10:30 BRT), 3 (15:00 BRT), 4 (19:30 BRT)
  temaManual?: string;
  imagemReferencia?: string;
  statusArtigo?: "publicado" | "rascunho";
}

// ============================================================================
// 1. DICIONÁRIO DE IMAGENS SACRAS SEGURAS (100% CATÓLICAS, ALTA DEFINIÇÃO)
// ============================================================================
const IMAGENS_SEGURAS_CATEGORIA: Record<string, { capa: string; alt: string; secundaria: string; legenda: string }> = {
  // VATICANO / NOTÍCIAS DA SANTA SÉ
  vaticano: {
    capa: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&q=80&w=1200",
    alt: "Praça e solene Basílica de São Pedro no Vaticano",
    secundaria: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200",
    legenda: "A Cúpula da Basílica de São Pedro em Roma, símbolo da unidade da Igreja Católica Apostólica Romana"
  },
  // TEOLOGIA / DOUTRINA / EUCARISTIA
  teologia: {
    capa: "https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200",
    alt: "Altar Eucarístico solene com Cálice da Santa Missa e Sagrada Escritura",
    secundaria: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200",
    legenda: "O sacrifício eucarístico e o mistério sublime da presença real de Cristo no altar"
  },
  // ESPIRITUALIDADE / ORAÇÃO MATINAL
  espiritualidade: {
    capa: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200",
    alt: "Bíblia Sagrada aberta no altar com velas acesas e Crucifixo",
    secundaria: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
    legenda: "O silêncio interior e o diálogo diário com Deus através da oração e da meditação da Palavra"
  },
  // JUVENTUDE & FÉ / ADORAÇÃO / MISSÃO
  juventude: {
    capa: "https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=1200",
    alt: "Jovem em adoração ao Santíssimo Sacramento exposto no Ostensório",
    secundaria: "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&q=80&w=1200",
    legenda: "Diante do Santíssimo Sacramento: a juventude católica encontra a verdadeira força para ser sal da terra"
  },
  // LITURGIA / SANTOS / DEVOÇÃO MARIANA
  liturgia: {
    capa: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200",
    alt: "Vitral sacro gótico de catedral iluminado pela luz solar celestial",
    secundaria: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200",
    legenda: "A beleza transcendental da liturgia e a intercessão materna da Santíssima Virgem Maria"
  }
};

// ============================================================================
// 2. FILTRO DE EXCLUSÃO SEVERO DE IMAGENS (SEM IMAGENS INADEQUADAS)
// ============================================================================
const TERMOS_PROIBIDOS = [
  "mosque", "mesquita", "pagoda", "pagode", "hindu", "buddhist", "buda", "buddha",
  "temple", "shrine", "crowd", "street", "skyline", "skyscraper", "prédios",
  "islam", "mecca", "medina", "torii", "balinese", "bali"
];

// IDs conhecidos do Unsplash de mesquitas e templos orientais que foram banidos
const BLACKLIST_UNSPLASH_IDS = [
  "photo-1519817650390", // Mesquita Shah Alam
  "photo-1544644181"     // Templo Ulun Danu Bratan
];

function validarImagemSegura(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const urlLower = url.toLowerCase();

  // Verifica protocolo e extensão
  if (!urlLower.startsWith("http://") && !urlLower.startsWith("https://")) return false;

  // Verifica blacklist de IDs
  for (const blackId of BLACKLIST_UNSPLASH_IDS) {
    if (urlLower.includes(blackId)) return false;
  }

  // Verifica termos negativos
  for (const termo of TERMOS_PROIBIDOS) {
    if (urlLower.includes(termo)) return false;
  }

  return true;
}

// Gera prompt de IA com visual sagrado estrito caso geração de arte seja acionada
function gerarPromptVisualSagrado(tema: string): string {
  const temaLimpo = tema.replace(/[^\w\s\u00C0-\u00FF]/gi, "").trim();
  return `A high-resolution professional photograph of ${temaLimpo}, catholic sacred art style, reverent lighting, warm golden hour light inside a traditional catholic church, cinematic composition, 8k resolution`;
}

// ============================================================================
// 3. AGREGADOR DE NOTÍCIAS CATÓLICAS (RSS FEEDS EM TEMPO REAL)
// Fontes Oficiais: Vatican News PT, ACI Digital, CNBB, Canção Nova
// ============================================================================
interface NoticiaCatolica {
  titulo: string;
  resumo: string;
  link: string;
  imagemUrl?: string;
  fonte: string;
}

const FONTES_RSS = [
  { nome: "Vatican News PT", url: "https://www.vaticannews.va/pt.rss.xml" },
  { nome: "ACI Digital", url: "https://feeds.feedburner.com/acidigital" },
  { nome: "CNBB", url: "https://www.cnbb.org.br/feed/" },
  { nome: "Canção Nova Notícias", url: "https://noticias.cancaonova.com/feed/" }
];

async function buscarNoticiasCatolicasRecentes(): Promise<NoticiaCatolica[]> {
  const noticias: NoticiaCatolica[] = [];

  for (const fonte of FONTES_RSS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(fonte.url, {
        headers: { "User-Agent": "EclesiaBot/2.0 (+https://eclesia.blog)" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const xmlText = await res.text();
      const items = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

      for (let i = 0; i < Math.min(items.length, 5); i++) {
        const item = items[i];

        // Extrai título
        const rawTitle = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i) || [])[1] || "";
        const titulo = rawTitle.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, "").trim();

        // Extrai link
        const rawLink = (item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || [])[1] || "";
        const link = rawLink.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();

        // Extrai descrição
        const rawDesc = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || [])[1] || "";
        const resumo = rawDesc.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

        // Extrai URL de imagem oficial se houver
        let imagemUrl: string | undefined = undefined;
        const enclosureMatch = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
        const mediaMatch = item.match(/<media:content[^>]+url=["']([^"']+)["']/i);
        const thumbMatch = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
        const imgDescMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);

        const candidata = enclosureMatch?.[1] || mediaMatch?.[1] || thumbMatch?.[1] || imgDescMatch?.[1];
        if (candidata && validarImagemSegura(candidata)) {
          imagemUrl = candidata;
        }

        if (titulo && titulo.length > 15) {
          noticias.push({
            titulo,
            resumo: resumo.slice(0, 300),
            link,
            imagemUrl,
            fonte: fonte.nome
          });
        }
      }
    } catch (e: any) {
      console.warn(`[RSS Feeds] Aviso na fonte ${fonte.nome}:`, e.message);
    }
  }

  return noticias;
}

// ============================================================================
// 4. SELEÇÃO INTELIGENTE DE IMAGENS SACRAS POR CATEGORIA E CONTEXTO
// ============================================================================
function selecionarImagensArtigo(
  categoria: string,
  titulo: string = "",
  conteudo: string = "",
  imagemNoticiaOficial?: string
) {
  // Se houver imagem oficial válida e segura da matéria-fonte, prioriza
  if (imagemNoticiaOficial && validarImagemSegura(imagemNoticiaOficial)) {
    const fallbackMatriz = IMAGENS_SEGURAS_CATEGORIA.vaticano;
    return {
      capa: {
        url: imagemNoticiaOficial,
        alt: `${titulo} - Notícia eclesial oficial`
      },
      interna: {
        url: fallbackMatriz.secundaria,
        alt: fallbackMatriz.alt,
        legenda: fallbackMatriz.legenda
      }
    };
  }

  const texto = `${titulo} ${conteudo} ${categoria}`.toLowerCase();

  // Vaticano / Papa / Notícias
  if (texto.includes("vaticano") || texto.includes("papa") || texto.includes("santa sé") || texto.includes("notícia") || texto.includes("noticia") || categoria.toLowerCase().includes("vaticano")) {
    const f = IMAGENS_SEGURAS_CATEGORIA.vaticano;
    return {
      capa: { url: f.capa, alt: f.alt },
      interna: { url: f.secundaria, alt: f.alt, legenda: f.legenda }
    };
  }

  // Juventude & Fé / Carlo Acutis / Missão
  if (texto.includes("juventude") || texto.includes("jovem") || texto.includes("acutis") || texto.includes("missão") || texto.includes("vocação") || categoria.toLowerCase().includes("juventude")) {
    const f = IMAGENS_SEGURAS_CATEGORIA.juventude;
    return {
      capa: { url: f.capa, alt: f.alt },
      interna: { url: f.secundaria, alt: f.alt, legenda: f.legenda }
    };
  }

  // Teologia / Eucaristia / Doutrina
  if (texto.includes("teologia") || texto.includes("eucaristia") || texto.includes("missa") || texto.includes("sacramento") || texto.includes("doutrina") || categoria.toLowerCase().includes("teologia")) {
    const f = IMAGENS_SEGURAS_CATEGORIA.teologia;
    return {
      capa: { url: f.capa, alt: f.alt },
      interna: { url: f.secundaria, alt: f.alt, legenda: f.legenda }
    };
  }

  // Liturgia / Santos / Santoral
  if (texto.includes("liturgia") || texto.includes("santo") || texto.includes("santoral") || texto.includes("maria") || texto.includes("terço")) {
    const f = IMAGENS_SEGURAS_CATEGORIA.liturgia;
    return {
      capa: { url: f.capa, alt: f.alt },
      interna: { url: f.secundaria, alt: f.alt, legenda: f.legenda }
    };
  }

  // Fallback Padrão: Espiritualidade & Palavra de Deus
  const f = IMAGENS_SEGURAS_CATEGORIA.espiritualidade;
  return {
    capa: { url: f.capa, alt: f.alt },
    interna: { url: f.secundaria, alt: f.alt, legenda: f.legenda }
  };
}

// ============================================================================
// 5. MOTOR DE INTELIGÊNCIA ARTIFICIAL (GROQ / GROK)
// ============================================================================
async function chamarTextoIA(promptSistema: string, promptUsuario: string): Promise<string> {
  const isGroq = GROK_API_KEY.startsWith("gsk_");
  
  const endpoint = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.x.ai/v1/chat/completions";

  // Modelos homologados na infraestrutura Groq com limites de tokens adequados
  const modelos = isGroq
    ? [
        { nome: "openai/gpt-oss-120b", maxTokens: 3000 },
        { nome: "openai/gpt-oss-20b", maxTokens: 3000 },
        { nome: "qwen/qwen3.8-27b", maxTokens: 950 }
      ]
    : [
        { nome: "grok-2-latest", maxTokens: 3000 },
        { nome: "grok-beta", maxTokens: 3000 }
      ];

  let lastError = "";

  for (const item of modelos) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: item.nome,
          messages: [
            {
              role: "system",
              content: promptSistema + "\nATENÇÃO: Responda obrigatoriamente e exclusivamente em formato JSON puro (objeto JSON válido), sem comentários antes ou depois."
            },
            {
              role: "user",
              content: promptUsuario + "\nLembrete: Retorne estritamente um único objeto JSON válido."
            }
          ],
          temperature: 0.7,
          max_tokens: item.maxTokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `(${isGroq ? 'Groq' : 'xAI'} ${response.status}): ${errorText}`;
        console.warn(`[Edge Function IA Warning] Modelo ${item.nome} falhou:`, errorText);
        continue;
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content ?? "";

      let jsonString = rawContent.trim();
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      }

      if (jsonString) return jsonString;
    } catch (e: any) {
      lastError = e.message;
      console.warn(`[Edge Function IA Exception] Modelo ${item.nome}:`, e);
    }
  }

  throw new Error(`Erro na API de Texto: ${lastError}`);
}

// Parser JSON com fallback e extração robusta de campos
function parseJsonSeguro(raw: string): any {
  if (!raw || typeof raw !== "string") return {};
  let cleaned = raw.trim();

  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    cleaned = jsonBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }

  let obj: any = {};
  try {
    obj = JSON.parse(cleaned);
  } catch {
    // Parser resiliente de múltiplos estágios para extrair campos
    const extrairCampo = (chave: string) => {
      // 1. Tenta correspondência padrão
      const reg = new RegExp(`"${chave}"\\s*:\\s*"([\\s\\S]*?)(?="\\s*,\\s*"[a-zA-Z0-9_]+"|\\s*"\\s*})`, "i");
      const m = cleaned.match(reg);
      if (m && m[1]) return m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();

      // 2. Tenta busca por delimitador de chave subsequente
      const startIdx = cleaned.search(new RegExp(`"${chave}"\\s*:\\s*"`, "i"));
      if (startIdx === -1) return "";
      const valStart = cleaned.indexOf('"', cleaned.indexOf(':', startIdx) + 1) + 1;
      const nextKeyMatch = cleaned.slice(valStart).search(/",\s*"[a-zA-Z0-9_]+"\s*:/);
      if (nextKeyMatch !== -1) {
        return cleaned.slice(valStart, valStart + nextKeyMatch).replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
      }
      const endMatch = cleaned.slice(valStart).search(/"\s*}\s*$/);
      if (endMatch !== -1) {
        return cleaned.slice(valStart, valStart + endMatch).replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
      }
      return "";
    };

    obj = {
      titulo: extrairCampo("titulo") || extrairCampo("title"),
      conteudo: extrairCampo("conteudo") || extrairCampo("article") || extrairCampo("content") || extrairCampo("body"),
      resumo: extrairCampo("resumo") || extrairCampo("summary") || extrairCampo("excerpt"),
      slug: extrairCampo("slug"),
      categoria: extrairCampo("categoria") || extrairCampo("category")
    };
  }

  const tituloFinal = obj.titulo || obj.title || obj.headline || "Artigo Católico Eclesia";
  // O slug deve ser SEMPRE gerado fielmente a partir do título do artigo
  const slugGeradoDoTitulo = tituloFinal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return {
    titulo: tituloFinal,
    slug: slugGeradoDoTitulo || (obj.slug || "artigo-catolico").toLowerCase().replace(/[^a-z0-9-]/g, ""),
    resumo: obj.resumo || obj.summary || obj.excerpt || obj.description || "Artigo de reflexão e fé no Portal Eclesia.",
    conteudo: obj.conteudo || obj.article || obj.content || obj.body || obj.texto || "",
    categoria: obj.categoria || obj.category || "Teologia",
    tempoLeitura: obj.tempoLeitura || obj.read_time || "5 min de leitura",
    metaTitle: obj.metaTitle || obj.meta_title || `${tituloFinal} | Eclesia`,
    metaDescription: obj.metaDescription || obj.meta_description || obj.resumo || obj.summary,
    keywords: obj.keywords || ["Fé Católica", "Portal Eclesia", "Igreja Católica"]
  };
}

function formatarTextoMarkdown(texto: string): string {
  if (!texto) return "";
  return texto
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/([^\n])\n(#{2,4}\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(>\s)/g, "$1\n\n$2")
    .replace(/\s*\[ORACAO(?::\s*([^\]]+))?\]\s*/gi, "\n\n[ORACAO:$1]\n")
    .replace(/\s*\[\/ORACAO\]\s*/gi, "\n[/ORACAO]\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ============================================================================
// 6. HANDLER PRINCIPAL DA EDGE FUNCTION
// ============================================================================
serve(async (req: Request) => {
  // Pre-flight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let payload: RequestPayload = {};
    if (req.method === "POST") {
      try {
        payload = await req.json();
      } catch {
        payload = {};
      }
    }

    const hoje = new Date();
    // Hora no fuso de Brasília (UTC-3)
    const brtHours = new Date(hoje.getTime() - 3 * 60 * 60 * 1000).getUTCHours();
    const dataFormatadaPtBr = hoje.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    // Determina o slot editorial de acordo com payload ou horário
    // Slot 1 (06:00 BRT): Formação Espiritual e Oração Matinal (50%)
    // Slot 2 (10:30 BRT): Formação Teológica e Catecismo (50%)
    // Slot 3 (15:00 BRT): Notícia Vaticano / Santa Sé em Alta (50% Notícias)
    // Slot 4 (19:30 BRT): Notícia da Igreja no Brasil / Juventude & Missão (50% Notícias)
    let slotEscolhido = payload.slot;
    if (!slotEscolhido) {
      if (payload.tipo === "artigo_slot_1" || payload.tipo === "espiritualidade") slotEscolhido = 1;
      else if (payload.tipo === "artigo_slot_2" || payload.tipo === "teologia") slotEscolhido = 2;
      else if (payload.tipo === "artigo_slot_3" || payload.tipo === "vaticano") slotEscolhido = 3;
      else if (payload.tipo === "artigo_slot_4" || payload.tipo === "noticia") slotEscolhido = 4;
      else {
        // Inferência automática por horário de Brasília
        if (brtHours >= 5 && brtHours < 10) slotEscolhido = 1;
        else if (brtHours >= 10 && brtHours < 14) slotEscolhido = 2;
        else if (brtHours >= 14 && brtHours < 18) slotEscolhido = 3;
        else slotEscolhido = 4;
      }
    }

    const regrasSeo = `
      CRITÉRIOS ESTRITOS DE SEO DO PORTAL ECLESIA (SCORE 100%):
      1. "titulo": Título magnético com EXATAMENTE entre 38 e 63 caracteres.
      2. "metaTitle": Título alternativo com 45 a 60 caracteres.
      3. "metaDescription": Resumo instigante com EXATAMENTE entre 125 e 155 caracteres.
      4. "slug": minúsculas, hifens e números (sem acentos), gerado a partir do título.
      5. "conteudo": No mínimo 700 palavras. Formatação em Markdown rico com subtítulos '## ', citações bíblicas/doutrinárias '>' e bloco final de oração [ORACAO: Título da Oração] ... [/ORACAO].
      6. "resumo": Entre 120 e 160 caracteres.
    `;

    const promptSistema = `Você é um jornalista católico investigativo e teólogo fiel ao Magistério da Igreja Católica, comunicando com a juventude no estilo vibrante de São João Paulo II e Carlo Acutis.
PROIBIDO ABSOLUTAMENTE:
- Clichês genéricos de IA ("No cenário contemporâneo", "Nos dias de hoje", "Em suma", "Vale ressaltar", "Um farol de esperança").
- Imagens ou conceitos estranhos à Tradição e Doutrina Católica.
- Inventar declarações falsas do Papa ou encíclicas fictícias.
Finalize SEMPRE com uma oração católica sincera e fervorosa no formato:
[ORACAO: Oração do Fiel Cristão]
Senhor Deus todo-poderoso...
[/ORACAO]`;

    let promptUsuario = "";
    let isTrending = false;
    let imagemNoticiaEncontrada: string | undefined = undefined;

    // Busca notícias recentes via RSS feeds oficiais católicos
    let noticiasRecentes: NoticiaCatolica[] = [];
    if (slotEscolhido === 3 || slotEscolhido === 4 || payload.tipo === "noticia" || payload.tipo === "vaticano") {
      noticiasRecentes = await buscarNoticiasCatolicasRecentes();
    }

    // ========================================================================
    // SLOT 1 (06:00 BRT): FORMAÇÃO ESPIRITUAL & ORAÇÃO MATINAL (50% Formação)
    // ========================================================================
    if (slotEscolhido === 1) {
      promptUsuario = `
        LINHA EDITORIAL: FORMAÇÃO ESPIRITUAL & VIDA DE ORAÇÃO MATINAL (${dataFormatadaPtBr})
        Escreva um artigo inspirador e profundo sobre o cultivo da vida interior, o silêncio da oração, a Santa Missa diária, a centralidade da Eucaristia e a devoção mariana.
        ${regrasSeo}
        Retorne APENAS um JSON válido com categoria "Espiritualidade" e tempoLeitura "5 min de leitura".
      `;
    }
    // ========================================================================
    // SLOT 2 (10:30 BRT): TEOLOGIA CATÓLICA, DOUTRINA & CATECISMO (50% Formação)
    // ========================================================================
    else if (slotEscolhido === 2) {
      promptUsuario = `
        LINHA EDITORIAL: TEOLOGIA CATÓLICA, DOUTRINA & MAGISTÉRIO (${dataFormatadaPtBr})
        Escreva um artigo teológico denso, claro e acessível sobre a Eucaristia como coração da Igreja, a graça dos Sacramentos, o Catecismo da Igreja Católica e a sabedoria dos Santos Padres e Doutores (Santo Tomás de Aquino, Santo Agostinho, Santa Teresa d'Ávila).
        ${regrasSeo}
        Retorne APENAS um JSON válido com categoria "Teologia" e tempoLeitura "6 min de leitura".
      `;
    }
    // ========================================================================
    // SLOT 3 (15:00 BRT): NOTÍCIA ATUAL 1 - SANTA SÉ & VATICANO (50% Notícias)
    // ========================================================================
    else if (slotEscolhido === 3) {
      isTrending = true;
      // Filtra notícias relacionadas ao Vaticano / Santa Sé / Papa
      const noticiaVaticano = noticiasRecentes.find(n => 
        n.fonte.includes("Vatican") || n.titulo.toLowerCase().includes("papa") || n.titulo.toLowerCase().includes("vatican") || n.titulo.toLowerCase().includes("santa sé")
      ) || noticiasRecentes[0];

      if (noticiaVaticano) {
        imagemNoticiaEncontrada = noticiaVaticano.imagemUrl;
        promptUsuario = `
          LINHA EDITORIAL: NOTÍCIA EM ALTA NO MUNDO CATÓLICO / SANTA SÉ (${dataFormatadaPtBr})
          Baseie o artigo no seguinte acontecimento real recente noticiado pelas agências católicas:
          Título da Notícia: "${noticiaVaticano.titulo}"
          Fonte Oficial: ${noticiaVaticano.fonte} (${noticiaVaticano.link})
          Resumo do Fato: "${noticiaVaticano.resumo}"

          INSTRUÇÕES:
          1. Escreva uma matéria jornalística aprofundada, unindo cobertura factual à análise teológica e pastoral do que isso significa para a vida dos fiéis no mundo de hoje.
          2. Conecte o evento com o Magistério da Igreja e as palavras do Santo Padre.
          ${regrasSeo}
          Retorne APENAS um JSON válido com categoria "Vaticano", tempoLeitura "5 min de leitura".
        `;
      } else {
        promptUsuario = `
          LINHA EDITORIAL: NOTÍCIAS DA SANTA SÉ & ATUALIDADES DA IGREJA (${dataFormatadaPtBr})
          Escreva uma reportagem jornalística e teológica sobre os recentes pronunciamentos do Papa e a missão diplomática e evangelizadora da Santa Sé pela paz e dignidade humana.
          ${regrasSeo}
          Retorne APENAS um JSON válido com categoria "Vaticano", tempoLeitura "5 min de leitura".
        `;
      }
    }
    // ========================================================================
    // SLOT 4 (19:30 BRT): NOTÍCIA ATUAL 2 - IGREJA NO BRASIL & JUVENTUDE (50% Notícias)
    // ========================================================================
    else {
      isTrending = true;
      // Filtra notícia nacional ou missionária (CNBB, Canção Nova, ACI Digital)
      const noticiaBrasil = noticiasRecentes.find(n => 
        n.fonte.includes("CNBB") || n.fonte.includes("Canção Nova") || n.fonte.includes("ACI")
      ) || noticiasRecentes[1] || noticiasRecentes[0];

      if (noticiaBrasil) {
        imagemNoticiaEncontrada = noticiaBrasil.imagemUrl;
        promptUsuario = `
          LINHA EDITORIAL: NOTÍCIA EM ALTA - IGREJA NO BRASIL, MISSÃO & JUVENTUDE (${dataFormatadaPtBr})
          Baseie o artigo no seguinte acontecimento real recente noticiado pelas fontes católicas:
          Título da Notícia: "${noticiaBrasil.titulo}"
          Fonte Oficial: ${noticiaBrasil.fonte} (${noticiaBrasil.link})
          Resumo do Fato: "${noticiaBrasil.resumo}"

          INSTRUÇÕES:
          1. Escreva uma matéria vibrante focada na ação missionária, na defesa da fé e no testemunho da Igreja no Brasil e no mundo.
          2. Destaque como os jovens católicos podem se engajar ativamente e viver sua vocação.
          ${regrasSeo}
          Retorne APENAS um JSON válido com categoria "Juventude & Fé", tempoLeitura "5 min de leitura".
        `;
      } else {
        promptUsuario = `
          LINHA EDITORIAL: JUVENTUDE, MISSÃO E ACONTECIMENTOS DA IGREJA (${dataFormatadaPtBr})
          Escreva um artigo jornalístico contemporâneo sobre o testemunho dos jovens católicos na cultura atual, a herança do Beato Carlo Acutis e o renascimento missionário da fé.
          ${regrasSeo}
          Retorne APENAS um JSON válido com categoria "Juventude & Fé", tempoLeitura "5 min de leitura".
        `;
      }
    }

    // Geração de Texto com IA
    const jsonTexto = await chamarTextoIA(promptSistema, promptUsuario);
    const artigo = parseJsonSeguro(jsonTexto);

    // Seleção Curada de Imagens Sacras (100% Autênticas Católicas)
    const parSacro = selecionarImagensArtigo(
      artigo.categoria,
      artigo.titulo,
      artigo.conteudo,
      payload.imagemReferencia || imagemNoticiaEncontrada
    );

    const urlCapaFinal = parSacro.capa.url;
    const urlInternaFinal = parSacro.interna.url;

    let conteudoTratado = formatarTextoMarkdown(artigo.conteudo);
    if (!conteudoTratado || conteudoTratado.length < 250) {
      conteudoTratado = `## ${artigo.titulo}\n\n${artigo.resumo}\n\nA Igreja Católica, fiel à sua missão evangelizadora, acompanha de perto os acontecimentos que moldam a nossa sociedade e a vida espiritual dos fiéis. Diante dos desafios da contemporaneidade, a voz do Magistério e os ensinamentos dos Santos Padres ressoam como um apelo contínuo à fidelidade a Cristo e ao Evangelho.\n\n> "Ide por todo o mundo e pregai o Evangelho a toda criatura." (São Marcos 16, 15)\n\nQue este acontecimento renove em nossos corações o fervor apostólico, o amor à Santa Igreja e o compromisso de testemunhar a verdade cristã em todos os ambientes.\n\n[ORACAO: Oração pela Igreja e pela Missão]\nSenhor Jesus Cristo, Redentor do gênero humano, guardai a Vossa Santa Igreja na unidade e na paz. Iluminai o Papa, os bispos e todos os fiéis para que sejamos no mundo verdadeiras testemunhas do Vosso Reino de amor e verdade.\nAmém.\n[/ORACAO]`;
    }
    const statusFinal = payload.statusArtigo || "publicado";
    const dataPublicacao = new Date().toISOString();
    const slugFinal = artigo.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const novoArtigoDb = {
      title: artigo.titulo,
      slug: slugFinal,
      excerpt: artigo.resumo,
      content: conteudoTratado,
      cover_image: urlCapaFinal,
      category: artigo.categoria || "Teologia",
      type: "artigo",
      author_name: "Redação Eclesia",
      read_time: artigo.tempoLeitura || "5 min de leitura",
      status: statusFinal,
      source: "ia_grok",
      featured: false,
      trending: isTrending,
      meta_title: artigo.metaTitle || artigo.titulo,
      meta_description: artigo.metaDescription || artigo.resumo,
      keywords: artigo.keywords || ["Fé Católica", "Igreja Católica"],
      published_at: dataPublicacao
    };

    const { data: insertedData, error: dbError } = await supabase
      .from("articles")
      .upsert(novoArtigoDb, { onConflict: "slug" })
      .select()
      .single();

    if (dbError) {
      console.error("[Database Error]:", dbError);
      throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        slot: slotEscolhido,
        editorial: slotEscolhido <= 2 ? "50% Formação Teológica/Espiritual" : "50% Notícias em Alta (RSS/Web)",
        message: `Novo artigo gerado com sucesso! (Slot ${slotEscolhido}: ${artigo.categoria})`,
        article: {
          ...insertedData,
          secondary_image: urlInternaFinal,
          visual_prompt_fallback: gerarPromptVisualSagrado(artigo.titulo)
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: any) {
    console.error("[Edge Function Error]:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido ao processar artigo com IA."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
