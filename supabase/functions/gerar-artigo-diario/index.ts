// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR ARTIGO DIÁRIO COM IA
// Integração: Groq / Grok + Acervo de Arte Sacra Católico + PostgreSQL
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers CORS para permitir requisições do painel ERP Eclesia
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
  tipo?: "liturgia" | "tema_em_alta" | "santo" | "manual";
  temaManual?: string;
  imagemReferencia?: string;
  statusArtigo?: "publicado" | "rascunho";
}

// ============================================================================
// SELETOR DE ARTE SACRA CATÓLICA AUTÊNTICA (100% ATIVA E VERIFICADA)
// ============================================================================
function selecionarImagensSacras(
  tipo: string,
  titulo: string = "",
  conteudo: string = "",
  categoria: string = ""
) {
  const texto = `${titulo} ${conteudo} ${categoria}`.toLowerCase();

  // Carlo Acutis / Juventude / Digital
  if (texto.includes("acutis") || texto.includes("jovem") || texto.includes("juventude") || texto.includes("digital")) {
    return {
      capa: {
        url: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200",
        alt: "Nave de catedral iluminada e Santíssimo Sacramento: a Eucaristia de Carlo Acutis"
      },
      interna: {
        url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200",
        alt: "Altar com a Cruz de Cristo, Bíblia aberta e velas acesas",
        legenda: "A Palavra de Deus e a adoração eucarística que transformam a vida do jovem cristão"
      }
    };
  }

  // Eucaristia / Santa Missa / Comunhão
  if (texto.includes("eucaristia") || texto.includes("missa") || texto.includes("sacramento") || texto.includes("comunhao") || texto.includes("adoracao")) {
    return {
      capa: {
        url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200",
        alt: "Cálice de ouro sagrado e Altar da Santa Missa em solene celebração eucarística"
      },
      interna: {
        url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200",
        alt: "Vitral clássico de catedral com luz celestial radiante",
        legenda: "A presença real de Nosso Senhor Jesus Cristo no Santíssimo Sacramento"
      }
    };
  }

  // Oração / Terço / Devoção Mariana
  if (texto.includes("terco") || texto.includes("rosario") || texto.includes("maria") || texto.includes("oracao")) {
    return {
      capa: {
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
        alt: "Santo Terço católico nas mãos em profunda oração e contemplação"
      },
      interna: {
        url: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200",
        alt: "Imagem sacra da Virgem Maria em recolhimento devocional",
        legenda: "A intercessão amorosa de Nossa Senhora que nos conduz ao Coração de Jesus"
      }
    };
  }

  // Liturgia Diária
  if (tipo === "liturgia" || texto.includes("liturgia") || texto.includes("evangelho")) {
    return {
      capa: {
        url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200",
        alt: "Cálice Sagrado e Altar em solene celebração litúrgica"
      },
      interna: {
        url: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200",
        alt: "Bíblia Sagrada aberta iluminada pela luz da Palavra Viva",
        legenda: "A Palavra de Deus que ilumina os passos do nosso dia a dia"
      }
    };
  }

  // Santos
  if (tipo === "santo" || texto.includes("santo") || texto.includes("santidade")) {
    return {
      capa: {
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200",
        alt: "Pintura sacra clássica renascentista retratando a vida dos santos"
      },
      interna: {
        url: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200",
        alt: "Altar e nave histórica de igreja católica",
        legenda: "O testemunho heroico dos santos que iluminam o caminho da Igreja"
      }
    };
  }

  // Geral / Teologia
  return {
    capa: {
      url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200",
      alt: "Altar com a Cruz de Cristo, velas acesas e Bíblia Sagrada"
    },
    interna: {
      url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200",
      alt: "Vitral clássico de catedral com luz sagrada",
      legenda: "A verdade imutável da fé católica que resplandece na Igreja"
    }
  };
}

// ============================================================================
// AUXILIAR: Chamada resiliente para Groq / Grok com Modelos Ativos
// ============================================================================
async function chamarTextoIA(promptSistema: string, promptUsuario: string): Promise<string> {
  const isGroq = GROK_API_KEY.startsWith("gsk_");
  
  const endpoint = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.x.ai/v1/chat/completions";

  // Modelos homologados e ativos na infraestrutura da Groq
  const modelos = isGroq
    ? ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound"]
    : ["grok-2-latest", "grok-beta"];

  let lastError = "";

  for (const model of modelos) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: promptSistema + "\nATENÇÃO: Responda APENAS com um objeto JSON válido, sem texto conversacional antes ou depois." },
            { role: "user", content: promptUsuario }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 3500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `(${isGroq ? 'Groq' : 'xAI'} ${response.status}): ${errorText}`;
        console.warn(`[Edge Function IA Warning] Modelo ${model} falhou:`, errorText);
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
      console.warn(`[Edge Function IA Exception] Modelo ${model}:`, e);
    }
  }

  throw new Error(`Erro na API de Texto: ${lastError}`);
}

// Parser JSON com mapeamento bilíngue
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
    const extrairCampo = (chave: string) => {
      const reg = new RegExp(`"${chave}"\\s*:\\s*"([\\s\\S]*?)(?="\\s*,\\s*"[a-zA-Z0-9_]+"|\\s*"\\s*})`, "i");
      const m = cleaned.match(reg);
      return m && m[1] ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim() : "";
    };
    obj = {
      titulo: extrairCampo("titulo") || extrairCampo("title"),
      conteudo: extrairCampo("conteudo") || extrairCampo("article") || extrairCampo("content"),
      resumo: extrairCampo("resumo") || extrairCampo("summary") || extrairCampo("excerpt"),
      slug: extrairCampo("slug")
    };
  }

  // Normalização de chaves inglês <-> português
  return {
    titulo: obj.titulo || obj.title || obj.headline || "Artigo Católico Eclesia",
    slug: (obj.slug || "artigo-catolico").toLowerCase().replace(/[^a-z0-9-]/g, ""),
    resumo: obj.resumo || obj.summary || obj.excerpt || obj.description || "Reflexão no Portal Eclesia.",
    conteudo: obj.conteudo || obj.article || obj.content || obj.body || obj.texto || "",
    categoria: obj.categoria || obj.category || "Teologia",
    tempoLeitura: obj.tempoLeitura || obj.read_time || "5 min de leitura",
    metaTitle: obj.metaTitle || obj.meta_title || obj.titulo || obj.title,
    metaDescription: obj.metaDescription || obj.meta_description || obj.resumo || obj.summary,
    keywords: obj.keywords || ["Fé Católica", "Portal Eclesia"]
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

function posicionarSegundaImagemNoArtigo(conteudo: string, urlImagem: string, legenda: string): string {
  if (!conteudo || !urlImagem) return conteudo;
  if (conteudo.includes("[img-") || conteudo.includes("![")) return conteudo;

  const tagImagem = `\n\n[img-centro: ${urlImagem} | 480px | ${legenda}]\n\n`;
  const indicesHeadings: number[] = [];
  const regex = /\n## /g;
  let match;
  while ((match = regex.exec(conteudo)) !== null) {
    indicesHeadings.push(match.index);
  }

  if (indicesHeadings.length >= 2) {
    const ponto = indicesHeadings.length >= 3 ? indicesHeadings[1] : indicesHeadings[0];
    return conteudo.slice(0, ponto) + tagImagem + conteudo.slice(ponto);
  }

  const blocos = conteudo.split("\n\n");
  if (blocos.length >= 4) {
    const meio = Math.floor(blocos.length / 2);
    blocos.splice(meio, 0, tagImagem.trim());
    return blocos.join("\n\n");
  }

  return conteudo + tagImagem;
}

// ============================================================================
// HANDLER PRINCIPAL DA EDGE FUNCTION
// ============================================================================
serve(async (req: Request) => {
  // Trata pre-flight CORS
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
    const dataFormatadaPtBr = hoje.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    const diaNum = hoje.getDate();
    const mesNum = hoje.getMonth() + 1;
    const anoNum = hoje.getFullYear();

    let tipoPost = payload.tipo;
    if (!tipoPost) {
      const horaAtual = hoje.getHours();
      tipoPost = horaAtual < 9 ? "liturgia" : "tema_em_alta";
    }

    const isTrending = tipoPost === "tema_em_alta";

    const regrasSeo = `
      CRITÉRIOS ESTRITOS DE SEO DO PAINEL ECLESIA (SCORE 100%):
      1. "titulo": Título magnético com EXATAMENTE entre 38 e 63 caracteres.
      2. "metaTitle": Título alternativo com 45 a 60 caracteres.
      3. "metaDescription": Resumo instigante com EXATAMENTE entre 125 e 155 caracteres.
      4. "slug": minúsculas, hifens e números (sem acentos).
      5. "conteudo": No mínimo 650 palavras. Formatação em Markdown com '## ', citação '>' e bloco [ORACAO: ...] ao final.
      6. "resumo": Entre 120 e 160 caracteres.
    `;

    const promptSistema = `Você é um jovem comunicador e teólogo católico apaixonado por Cristo, no estilo de São João Paulo II e Carlo Acutis falando diretamente com a juventude.
PROIBIDO ABSOLUTAMENTE clichês de IA ("No cenário contemporâneo", "Nos dias de hoje", "Em suma", "Vale ressaltar", "Um farol de esperança").
PROIBIDO inventar encíclicas ou santos fictícios. Fale sempre de realidades autênticas da Igreja Católica.
Conclua SEMPRE com uma oração católica sincera no formato:
[ORACAO: Oração do Jovem Cristão]
Senhor Jesus Cristo...
[/ORACAO]`;

    let promptUsuario = "";

    if (tipoPost === "liturgia") {
      promptUsuario = `
        Escreva o Artigo da "Liturgia Diária de Hoje" (${dataFormatadaPtBr}) com linguagem pastoral jovem e vibrante.
        ${regrasSeo}
        Retorne APENAS um JSON válido seguindo esta estrutura:
        {
          "titulo": "Liturgia de Hoje: O Chamado de Cristo (${diaNum}/${mesNum})",
          "slug": "liturgia-diaria-${diaNum}-${mesNum}-${anoNum}",
          "metaTitle": "Liturgia Diária: Evangelho de Hoje Comentado",
          "metaDescription": "Confira o Evangelho de hoje e uma reflexão jovem e viva para transformar seu dia com a fé católica.",
          "resumo": "A Palavra de Deus proclamada na Missa de hoje e conselhos práticos para a sua vida cristã.",
          "conteudo": "Escreva aqui todo o artigo completo em Markdown com mais de 650 palavras...",
          "categoria": "Liturgia Diária",
          "tempoLeitura": "5 min de leitura",
          "keywords": ["Liturgia Diária", "Evangelho do dia", "Santa Missa", "Vida de Oração", "Palavra de Deus"]
        }
      `;
    } else if (tipoPost === "santo") {
      promptUsuario = `
        Escreva o Artigo do Santo comemorado pela Igreja hoje (${dataFormatadaPtBr}).
        Apresente o santo como alguém real que venceu pela fé em Cristo e nos ensina a ser santos hoje.
        ${regrasSeo}
        Retorne APENAS um JSON válido seguindo esta estrutura:
        {
          "titulo": "Título com nome do Santo (38 a 60 caracteres)",
          "slug": "santo-do-dia-slug",
          "metaTitle": "Santo do Dia: Vida e Oração (45 a 60 caracteres)",
          "metaDescription": "Conheça a história inspiradora e a oração do santo de hoje (125 a 155 caracteres)",
          "resumo": "História, milagres e ensinamentos práticos para a sua vida cristã (120 a 160 caracteres)",
          "conteudo": "Escreva aqui todo o artigo completo em Markdown com mais de 650 palavras...",
          "categoria": "Santo do Dia",
          "tempoLeitura": "5 min de leitura",
          "keywords": ["Santo do Dia", "Vida dos Santos", "Fé Católica"]
        }
      `;
    } else {
      promptUsuario = `
        RADAR DE TENDÊNCIAS CATÓLICAS PARA A JUVENTUDE HOJE (${dataFormatadaPtBr}):
        Escolha um tema católico real, profundo e vibrante que dialogue com os jovens de hoje (ex: Carlo Acutis e as redes sociais, o segredo da Confissão, batalha da oração, namoro santo, a beleza da Missa).
        ${regrasSeo}
        Retorne APENAS um JSON válido seguindo esta estrutura:
        {
          "titulo": "Título direto e magnético (38 a 60 caracteres)",
          "slug": "slug-sem-acentos-e-hifens",
          "metaTitle": "Título SEO com 45 a 60 caracteres",
          "metaDescription": "Descrição instigante para o Google com 125 a 155 caracteres",
          "resumo": "Resumo envolvente para o card com 120 a 160 caracteres",
          "conteudo": "Escreva aqui todo o artigo completo em Markdown com mais de 650 palavras...",
          "categoria": "Juventude & Fé",
          "tempoLeitura": "5 min de leitura",
          "keywords": ["Santidade", "Juventude Católica", "Vida de Oração", "Carlo Acutis"]
        }
      `;
    }

    const jsonTexto = await chamarTextoIA(promptSistema, promptUsuario);
    const artigo = parseJsonSeguro(jsonTexto);

    // Seleção de Imagens Sacras Católicas
    const parSacro = selecionarImagensSacras(tipoPost, artigo.titulo, artigo.conteudo, artigo.categoria);
    let urlDaCapa = payload.imagemReferencia || parSacro.capa.url;
    let urlInterna = parSacro.interna.url;
    let legendaInterna = parSacro.interna.legenda;

    if (!payload.imagemReferencia && (tipoPost === "santo" || artigo.categoria === "Santo do Dia")) {
      try {
        const { data: santoBanco } = await supabase
          .from("saints")
          .select("image_url")
          .eq("feast_month", mesNum)
          .eq("feast_day", diaNum)
          .maybeSingle();

        if (santoBanco?.image_url) {
          urlDaCapa = santoBanco.image_url;
        }
      } catch (e) {
        console.warn("Consulta a saints ignorada:", e);
      }
    }

    let conteudoTratado = formatarTextoMarkdown(artigo.conteudo);
    conteudoTratado = posicionarSegundaImagemNoArtigo(conteudoTratado, urlInterna, legendaInterna);

    const statusFinal = payload.statusArtigo || "publicado";
    const dataPublicacao = new Date().toISOString();
    const slugFinal = `${artigo.slug.toLowerCase().replace(/[^a-z0-9-]/g, "")}`;

    const novoArtigoDb = {
      title: artigo.titulo,
      slug: slugFinal,
      excerpt: artigo.resumo,
      content: conteudoTratado,
      cover_image: urlDaCapa,
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
      keywords: artigo.keywords || [],
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
        message: `Novo artigo gerado com sucesso! (${tipoPost})`,
        article: {
          ...insertedData,
          secondary_image: urlInterna,
          gallery_images: [urlInterna]
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
