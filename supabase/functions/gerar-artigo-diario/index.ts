// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR 6 ARTIGOS DIÁRIOS
// Arquitetura: Deno + TypeScript + Supabase Storage + Groq/Grok/Gemini
// Otimizações: Anti-Duplicação (14 dias), Pipeline de Imagens Storage, SEO & GEO
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers CORS para chamadas externas e internas
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

// Variáveis de ambiente
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GROK_API_KEY = Deno.env.get("GROK_API_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

// Cliente administrativo Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RequestPayload {
  slot?: number; // 1 a 6
  tipo?: "santo" | "noticia_vaticano" | "espiritualidade_dores_1" | "juventude" | "noticia_brasil" | "espiritualidade_dores_2" | "manual";
  temaManual?: string;
  statusArtigo?: "publicado" | "rascunho";
}

// ────────────────────────────────────────────────────────────────────────────
// BANCO SACRO DE FALLBACK PERMANENTE (100% Católico e de Alta Resolução)
// ────────────────────────────────────────────────────────────────────────────
const FALLBACK_SACRO: Record<string, string> = {
  santo: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200",
  noticia_vaticano: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&q=80&w=1200",
  espiritualidade: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200",
  juventude: "https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=1200",
  noticia_brasil: "https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200"
};

// ────────────────────────────────────────────────────────────────────────────
// 1. DEDUPLICAÇÃO DE TEMAS E IMAGENS (ÚLTIMOS 14 DIAS)
// ────────────────────────────────────────────────────────────────────────────
async function obterHistoricoRecente(): Promise<{ titulos: string[]; imagens: Set<string> }> {
  const quatorzeDiasAtras = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("articles")
    .select("title, slug, cover_image")
    .gte("published_at", quatorzeDiasAtras)
    .order("published_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.warn("[Deduplicação] Falha ao consultar histórico:", error?.message);
    return { titulos: [], imagens: new Set() };
  }

  const titulos = data.map((a: { title: string }) => a.title).filter(Boolean);
  const imagens = new Set(data.map((a: { cover_image: string }) => a.cover_image).filter(Boolean));

  return { titulos, imagens };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. PIPELINE DE STORAGE (Download da Imagem e Upload Seguro no Bucket post-images)
// ────────────────────────────────────────────────────────────────────────────
async function baixarEArmazenarImagemNoStorage(
  imageUrl: string,
  slug: string
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "EclesiaBot/3.0 (+https://eclesia.blog)" }
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Status HTTP ${res.status}`);

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) throw new Error(`Content-Type não é imagem: ${contentType}`);

    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const buffer = await res.arrayBuffer();

    const fileName = `artigos/${slug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, buffer, {
        contentType,
        cacheControl: "31536000",
        upsert: true
      });

    if (uploadError) {
      console.error("[Storage Upload Error]:", uploadError.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (err: any) {
    console.warn(`[Storage Pipeline Warning] Falha ao enviar para storage: ${err.message}`);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 3. SANITIZAÇÃO DE MARKDOWN E CONTROLE RIGOROSO DE NEGRITO
// ────────────────────────────────────────────────────────────────────────────
function sanitizarMarkdownEFormatacao(texto: string): string {
  if (!texto) return "";

  let limpo = texto
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    // Garante quebra de linha dupla antes de títulos e citações
    .replace(/([^\n])\n(#{2,4}\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(>\s)/g, "$1\n\n$2")
    // Formata blocos devocionais e orações
    .replace(/\s*\[ORACAO(?::\s*([^\]]+))?\]\s*/gi, "\n\n[ORACAO:$1]\n")
    .replace(/\s*\[\/ORACAO\]\s*/gi, "\n[/ORACAO]\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Remove negrito (**) de parágrafos inteiros ou frases com mais de 5 palavras
  limpo = limpo.replace(/\*\*([^*]+)\*\*/g, (match, conteudo) => {
    const palavras = conteudo.trim().split(/\s+/);
    if (palavras.length > 5 || conteudo.length > 40) {
      return conteudo;
    }
    return match;
  });

  // Remove tags <b> ou <strong> abusivas
  limpo = limpo.replace(/<(b|strong)>([\s\S]*?)<\/\1>/gi, (match, tag, conteudo) => {
    const palavras = conteudo.trim().split(/\s+/);
    if (palavras.length > 5 || conteudo.length > 40) {
      return conteudo;
    }
    return match;
  });

  return limpo;
}

// ────────────────────────────────────────────────────────────────────────────
// 4. MOTOR DE INTELIGÊNCIA ARTIFICIAL (GROQ / GROK / GEMINI)
// ────────────────────────────────────────────────────────────────────────────
async function chamarIA(promptSistema: string, promptUsuario: string): Promise<string> {
  const isGroq = GROK_API_KEY.startsWith("gsk_");
  const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
  const modelos = isGroq ? ["openai/gpt-oss-120b", "openai/gpt-oss-20b"] : ["grok-2-latest"];

  for (const modelo of modelos) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: "system", content: promptSistema + "\nATENÇÃO: Retorne ESTRITAMENTE um objeto JSON válido, sem comentários antes ou depois." },
            { role: "user", content: promptUsuario }
          ],
          temperature: 0.65,
          max_tokens: 3800
        })
      });

      if (!res.ok) continue;
      const data = await res.json();
      let raw = data.choices?.[0]?.message?.content ?? "";
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
      if (raw) return raw;
    } catch (e) {
      console.warn(`Erro no modelo ${modelo}:`, e);
    }
  }

  // Fallback Gemini
  if (GEMINI_API_KEY) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${promptSistema}\n\n${promptUsuario}\nRetorne EXCLUSIVAMENTE um JSON válido.` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      })
    });
    if (res.ok) {
      const data = await res.json();
      let raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
    }
  }

  throw new Error("Falha em todos os provedores de IA (Groq, xAI e Gemini).");
}

// ────────────────────────────────────────────────────────────────────────────
// 5. HANDLER PRINCIPAL (ORQUESTRADOR DOS 6 ARTIGOS DIÁRIOS)
// ────────────────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let payload: RequestPayload = {};
    if (req.method === "POST") {
      try { payload = await req.json(); } catch { payload = {}; }
    }

    const hoje = new Date();
    // Hora no fuso de Brasília (UTC-3)
    const brtHours = new Date(hoje.getTime() - 3 * 60 * 60 * 1000).getUTCHours();
    const dataExtenso = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    // Determina o slot (1 a 6) por payload ou horário
    let slot = payload.slot;
    if (!slot) {
      if (payload.tipo === "santo") slot = 1;
      else if (payload.tipo === "noticia_vaticano") slot = 2;
      else if (payload.tipo === "espiritualidade_dores_1") slot = 3;
      else if (payload.tipo === "juventude") slot = 4;
      else if (payload.tipo === "noticia_brasil") slot = 5;
      else if (payload.tipo === "espiritualidade_dores_2") slot = 6;
      else {
        if (brtHours >= 4 && brtHours < 7) slot = 1;       // 05:00 Santo do Dia
        else if (brtHours >= 7 && brtHours < 10) slot = 2;  // 07:30 Notícia 1
        else if (brtHours >= 10 && brtHours < 13) slot = 3; // 10:30 Espiritualidade 1
        else if (brtHours >= 13 && brtHours < 16) slot = 4; // 13:30 Juventude
        else if (brtHours >= 16 && brtHours < 19) slot = 5; // 16:30 Notícia 2
        else slot = 6;                                      // 19:30 Espiritualidade 2
      }
    }

    // 1. Busca histórico dos últimos 14 dias para evitar duplicatas de tema e imagem
    const { titulos: titulosRecentes, imagens: imagensUsadas } = await obterHistoricoRecente();
    const listaExclusao = titulosRecentes.slice(0, 40).map(t => `- "${t}"`).join("\n");

    const diretrizesPromptSistema = `Você é um jornalista sênior católico e teólogo fiel ao Magistério da Igreja Católica, escrevendo para o portal eclesia.blog.

REGRAS CRÍTICAS DE ESTILO, SEO E GEO (Generative Engine Optimization):
1. EXTENSÃO MÍNIMA OBRIGATÓRIA: Entre 850 e 1.300 palavras. O texto deve ser denso, claro, profundo e esclarecedor.
2. NEGRITO CONTROLADO: É ESTRITAMENTE PROIBIDO colocar parágrafos inteiros ou frases longas em negrito (**). Use negrito APENAS para destacar 2 a 3 palavras-chave pontuais por seção.
3. GEO (Generative Engine Optimization): Imediatamente após cada subtítulo (## e ###), apresente 1 parágrafo com resposta direta, objetiva e conceitual que possa ser citada por IAs (Perplexity, ChatGPT, Google SGE) como fonte de autoridade doutrinária.
4. ESTRUTURA DO CONTEÚDO:
   - Introdução cativante (1-2 parágrafos apresentando a questão humana ou eclesial).
   - 3 a 4 seções estruturadas com subtítulos '## Título Semântico'.
   - Ao menos 2 citações bíblicas em blockquote: > "Texto bíblico." (Referência)
   - Ao menos 1 referência explícita ao Catecismo da Igreja Católica (CIC § número) ou Encíclica Papal.
   - Ao menos 1 citação de Santo Padre ou Doutor da Igreja (Santo Agostinho, Santo Tomás de Aquino, etc.).
   - Conclusão pastoral prática com reflexão para o dia a dia.
   - Bloco devocional final obrigatório: [ORACAO: Título da Oração] ... [/ORACAO].

LISTA DE TEMAS PROIBIDOS (PUBLICADOS NOS ÚLTIMOS 14 DIAS - NÃO REPITA NEM SE APROXIME):
${listaExclusao || "Nenhum no momento."}`;

    let promptUsuario = "";
    let categoria = "Espiritualidade";
    let fallbackCategoryKey = "espiritualidade";
    let tipoArtigoDb: "artigo" | "noticia" = "artigo";

    switch (slot) {
      case 1: // 05:00 - Santo do Dia
        categoria = "Santo do Dia";
        fallbackCategoryKey = "santo";
        tipoArtigoDb = "artigo";
        promptUsuario = `Escreva o artigo completo sobre o Santo ou Beato comemorado na liturgia de hoje (${dataExtenso}).
Apresente com rigor histórico sua vida, virtudes heroicas, desafios de sua época e 3 lições práticas para a santidade hoje.
Finalize com a oração litúrgica oficial de intercessão do Santo.`;
        break;

      case 2: // 07:30 - Notícia 1: Vaticano & Santa Sé
        categoria = "Vaticano";
        fallbackCategoryKey = "noticia_vaticano";
        tipoArtigoDb = "noticia";
        promptUsuario = `Escreva uma reportagem aprofundada sobre os acontecimentos recentes da Santa Sé, pronunciamentos do Papa e a missão da Igreja no mundo (${dataExtenso}).
Una cobertura factual a uma análise doutrinária e pastoral sobre o impacto para os fiéis.`;
        break;

      case 3: // 10:30 - Espiritualidade & Dores Contemporâneas 1
        categoria = "Espiritualidade";
        fallbackCategoryKey = "espiritualidade";
        tipoArtigoDb = "artigo";
        promptUsuario = `Escreva um ensaio de espiritualidade e vida interior abordando uma dor contemporânea real: ANSIEDADE, SOLIDÃO, CANSAÇO MENTAL ou SOBRECARGA DIGITAL (${dataExtenso}).
Mostre como a oração contemplativa, a vida sacramental e a paz de Cristo trazem cura e serenidade à alma.`;
        break;

      case 4: // 13:30 - Juventude & Vocação
        categoria = "Juventude";
        fallbackCategoryKey = "juventude";
        tipoArtigoDb = "artigo";
        promptUsuario = `Escreva um artigo vibrante para jovens católicos sobre AFETIVIDADE, NAMORO SANTO, AMIZADES e PROPÓSITO VOCACIONAL (${dataExtenso}).
Inspire-se no testemunho do Beato Carlo Acutis e de São João Paulo II, desafiando a juventude a ser luz no ambiente digital e acadêmico.`;
        break;

      case 5: // 16:30 - Notícia 2: Igreja no Brasil & Missão
        categoria = "Igreja no Brasil";
        fallbackCategoryKey = "noticia_brasil";
        tipoArtigoDb = "noticia";
        promptUsuario = `Escreva uma matéria jornalística sobre a ação missionária da Igreja Católica no Brasil (${dataExtenso}).
Destaque iniciativas paroquiais de caridade, defesa da dignidade da pessoa humana, formação de lideranças e a alegria do Evangelho na cultura brasileira.`;
        break;

      case 6: // 19:30 - Espiritualidade & Dores Contemporâneas 2
      default:
        categoria = "Vida Interior";
        fallbackCategoryKey = "espiritualidade";
        tipoArtigoDb = "artigo";
        promptUsuario = `Escreva um artigo reflexivo e confortador sobre O MISTÉRIO DO SOFRIMENTO, A GRAÇA DO PERDÃO e A ESPERANÇA NA PROVAÇÃO (${dataExtenso}).
Aborde como vencer o ressentimento e encontrar consolo na Cruz redentora e nos sacramentos da Reconciliação e da Eucaristia.`;
        break;
    }

    const promptFinal = `${promptUsuario}

ESQUEMA OBRIGATÓRIO DA RESPOSTA EM JSON PURO:
{
  "titulo": "Título H1 claro, atrativo e sem sensacionalismo (42 a 65 caracteres)",
  "slug": "slug-limpo-sem-acentos-baseado-no-titulo",
  "resumo": "Meta description instigante com exatamente 135 a 160 caracteres contendo a palavra-chave",
  "conteudo": "Texto completo em Markdown com seções H2 e H3, oração final e sem negrito abusivo...",
  "visual_prompt": "Prompt em inglês para fotografia sacra realista e reverente, sem símbolos pagãos",
  "keywords": ["Palavra1", "Palavra2", "Palavra3"]
}`;

    // 2. Chamada à IA
    const jsonResposta = await chamarIA(diretrizesPromptSistema, promptFinal);
    let dadosArtigo: any = {};
    try {
      dadosArtigo = JSON.parse(jsonResposta);
    } catch {
      throw new Error("A IA gerou uma resposta que não pôde ser decodificada em JSON.");
    }

    const tituloFinal = dadosArtigo.titulo || `Reflexão Eclesia: ${dataExtenso}`;
    const slugFinal = (dadosArtigo.slug || tituloFinal)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);

    const conteudoTratado = sanitizarMarkdownEFormatacao(dadosArtigo.conteudo);

    // 3. Pipeline de Imagem Garantida com Upload no Supabase Storage (post-images)
    const seed = Math.floor(Math.random() * 999999);
    const promptVisual = encodeURIComponent(
      `${dadosArtigo.visual_prompt || "catholic sacred art church altar candlelight"}, high resolution, photorealistic, cinematic light, 8k, no mosques, no non-catholic elements`
    );
    const imagemCandidataUrl = `https://image.pollinations.ai/prompt/${promptVisual}?seed=${seed}&width=1200&height=675&nologo=true`;

    // Realiza o download do binário e faz upload no bucket "post-images"
    let urlCapaFinal = await baixarEArmazenarImagemNoStorage(imagemCandidataUrl, slugFinal);

    // Se falhar ou imagem já tiver sido usada nos últimos 14 dias, aplica o fallback do acervo seguro
    if (!urlCapaFinal || imagensUsadas.has(urlCapaFinal)) {
      urlCapaFinal = FALLBACK_SACRO[fallbackCategoryKey] || FALLBACK_SACRO.espiritualidade;
    }

    // Calcula tempo de leitura real (média de 180 palavras por minuto)
    const totalPalavras = conteudoTratado.split(/\s+/).length;
    const minutosLeitura = Math.max(3, Math.ceil(totalPalavras / 180));
    const tempoLeituraFinal = `${minutosLeitura} min de leitura`;

    const novoArtigoDb = {
      title: tituloFinal,
      slug: slugFinal,
      excerpt: dadosArtigo.resumo || "Artigo de reflexão e fé no Portal Eclesia.",
      content: conteudoTratado,
      cover_image: urlCapaFinal,
      category: categoria,
      type: tipoArtigoDb,
      author_name: "Redação Eclesia",
      read_time: tempoLeituraFinal,
      status: payload.statusArtigo || "publicado",
      source: "ia_grok",
      featured: slot === 2 || slot === 3,
      trending: tipoArtigoDb === "noticia",
      meta_title: `${tituloFinal} | Eclesia`,
      meta_description: (dadosArtigo.resumo || "").slice(0, 160),
      keywords: dadosArtigo.keywords || ["Fé Católica", "Igreja Católica"],
      published_at: new Date().toISOString()
    };

    // 4. Inserção no PostgreSQL com trava anti-duplicação por slug
    const { data: dbData, error: dbError } = await supabase
      .from("articles")
      .upsert(novoArtigoDb, { onConflict: "slug" })
      .select()
      .single();

    if (dbError) throw new Error(`Erro ao salvar artigo no Postgres: ${dbError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        slot,
        categoria,
        article: dbData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("[Erro na Edge Function]:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});