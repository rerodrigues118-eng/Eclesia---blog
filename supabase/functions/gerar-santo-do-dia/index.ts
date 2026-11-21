// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR SANTO DO DIA
// Schema real: id, name, slug, feast_month, feast_day, short_bio, full_bio,
//              patronage, category, image_url, title, feast_date,
//              summary, prayer, quotes, featured, updated_at
// Modelos: Groq (openai/gpt-oss-120b, openai/gpt-oss-20b) + Fallback Gemini 3.8 Flash
// Pipeline: IA → Pollinations.ai imagem → Supabase Storage (bucket saints)
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GROK_API_KEY = Deno.env.get("GROK_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Utilitários ────────────────────────────────────────────────────────────

function getTodayBRT(): { dateISO: string; month: number; day: number } {
  try {
    const brStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const [d, m, y] = brStr.split("/");
    return {
      dateISO: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`,
      month: parseInt(m, 10),
      day: parseInt(d, 10)
    };
  } catch {
    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const [dateISO] = brt.toISOString().split("T");
    const [, m, d] = dateISO.split("-");
    return { dateISO, month: parseInt(m, 10), day: parseInt(d, 10) };
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// ─── IA Generation (Groq + Gemini Fallback) ─────────────────────────────────

interface SaintFromAI {
  name: string;
  title: string;
  category: string;
  short_bio: string;
  full_bio: string;
  summary: string;
  patronage: string | null;
  prayer: string;
  quotes: string[];
  image_prompt: string;
}

async function chamarIASanto(month: number, day: number, dateISO: string): Promise<SaintFromAI> {
  const promptSistema = `Você é um hagiógrafo católico especialista no Santoral Romano e no Martyrologium Romanum da Igreja Católica.
Responda RIGOROSAMENTE E EXCLUSIVAMENTE em formato JSON puro, sem markdown, sem blocos \`\`\`json, sem introdução ou conclusão. Todo o texto deve ser em Português do Brasil de alto nível teológico e histórico.`;

  const promptUsuario = `Escreva um perfil biográfico canônico, completo, edificante e historicamente preciso do Santo, Beato ou Memória litúrgica comemorados em ${day}/${month} no Calendário Litúrgico Romano.
Retorne rigorosamente este JSON:
{
  "name": "Nome do Santo em português (ex: Santo Edmundo, São Clemente I, Santa Cecília)",
  "title": "Título litúrgico em português (ex: Rei e Mártir, Papa e Mártir, Virgem e Doutora da Igreja)",
  "category": "Mártir | Confessor | Virgem | Papa | Doutor | Bispo | Religioso | Leigo | Fundador | Beato",
  "short_bio": "Resumo de 2 a 3 frases impactantes e edificantes sobre o santo, seu testemunho e sua espiritualidade.",
  "full_bio": "Biografia completa e aprofundada em 6 a 8 parágrafos separados por \\n\\n. Mínimo de 600 a 1000 palavras. Cubra: nascimento e contexto histórico, vocação e caminho de santidade, lutas, virtudes heroicas e apostolado, martírio ou trânsito para o Céu, canonização e relevância pastoral para os fiéis hoje. PROIBIDO colocar parágrafos inteiros em negrito.",
  "summary": "Parágrafo de 80 a 120 palavras resumindo as virtudes e a lição de vida prática para os católicos hoje.",
  "patronage": "Padroeiro(a) de quem ou do quê (ou 'Igreja Católica' se universal)",
  "prayer": "Oração tradicional ou devocional ao santo, com 5 a 8 frases no estilo da liturgia católica, terminando com 'Por Cristo, nosso Senhor. Amém.'",
  "quotes": ["Frase, ensinamento ou máxima espiritual autêntica atribuída ao santo"],
  "image_prompt": "English 25-word visual prompt describing traditional Catholic religious artwork of this saint, iconography, renaissance style, sacred atmosphere, golden light"
}`;

  // 1. Tenta Groq
  if (GROK_API_KEY) {
    const isGroq = GROK_API_KEY.startsWith("gsk_");
    const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const modelos = isGroq ? ["openai/gpt-oss-120b", "openai/gpt-oss-20b"] : ["grok-2-latest"];

    for (const modelo of modelos) {
      try {
        console.log(`[gerar-santo-do-dia] Tentando IA modelo: ${modelo}...`);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROK_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: modelo,
            messages: [
              { role: "system", content: promptSistema },
              { role: "user", content: promptUsuario }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
            max_tokens: 4000
          })
        });

        if (!res.ok) {
          console.warn(`[gerar-santo-do-dia] Modelo ${modelo} retornou HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();
        let raw: string = json.choices?.[0]?.message?.content ?? "";
        raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as SaintFromAI;
        }
      } catch (e: any) {
        console.warn(`[gerar-santo-do-dia] Exceção em ${modelo}:`, e.message);
      }
    }
  }

  // 2. Fallback Gemini 3.8 Flash
  if (GEMINI_API_KEY) {
    console.log("[gerar-santo-do-dia] Usando fallback Gemini 3.8 Flash...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${promptSistema}\n\n${promptUsuario}` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
      })
    });

    if (res.ok) {
      const json = await res.json();
      let raw: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as SaintFromAI;
      }
    } else {
      console.error("[gerar-santo-do-dia] Gemini falhou com status:", res.status);
    }
  }

  throw new Error("Falha em todos os provedores de IA para gerar o perfil do Santo.");
}

// ─── Pipeline de Imagem: Pollinations.ai → Storage ──────────────────────────

async function gerarEFazerUploadImagem(imagePrompt: string, slug: string): Promise<string> {
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200";

  try {
    const encodedPrompt = encodeURIComponent(
      `${imagePrompt}, Catholic religious art, golden light, sacred painting, holy saint, portrait, no watermark, no text`
    );
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=800&model=flux&nologo=true&seed=${Date.now()}`;

    console.log(`[gerar-santo-do-dia] Baixando imagem de Pollinations para: ${slug}`);
    const imgRes = await fetch(pollinationsUrl, {
      headers: { "User-Agent": "EclesiaBot/1.0" },
      signal: AbortSignal.timeout(45000)
    });

    if (!imgRes.ok) throw new Error(`Pollinations falhou: ${imgRes.status}`);

    const arrayBuffer = await imgRes.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (uint8Array.length < 10000) throw new Error("Imagem muito pequena (< 10KB), descartando");

    // Upload para Supabase Storage (bucket "saints")
    const fileName = `${slug}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("saints")
      .upload(fileName, uint8Array, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (uploadError) throw new Error(`Upload Storage falhou: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from("saints").getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) throw new Error("Não foi possível obter URL pública da imagem");

    console.log(`[gerar-santo-do-dia] ✓ Imagem carregada: ${publicUrl}`);
    return publicUrl;

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[gerar-santo-do-dia] Falha no pipeline de imagem (${msg}). Usando fallback.`);
    return FALLBACK_IMAGE;
  }
}

// ─── Handler Principal ───────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    let { dateISO, month, day } = getTodayBRT();
    let force = false;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
          dateISO = body.date;
          const [, m, d] = dateISO.split("-");
          month = parseInt(m, 10);
          day = parseInt(d, 10);
        }
        if (body.force) force = Boolean(body.force);
      } catch {
        /* corpo vazio */
      }
    } else {
      const url = new URL(req.url);
      const dateParam = url.searchParams.get("date");
      if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        dateISO = dateParam;
        const [, m, d] = dateISO.split("-");
        month = parseInt(m, 10);
        day = parseInt(d, 10);
      }
      force = url.searchParams.get("force") === "true";
    }

    console.log(`[gerar-santo-do-dia] Data: ${dateISO} (mês=${month}, dia=${day}), force=${force}`);

    // 1. Verifica se já existe santo para feast_month + feast_day
    if (!force) {
      const { data: existing, error: selErr } = await supabase
        .from("saints")
        .select("id, name, slug, image_url, full_bio")
        .eq("feast_month", month)
        .eq("feast_day", day)
        .maybeSingle();

      if (!selErr && existing && existing.full_bio && existing.full_bio.length > 200) {
        console.log(`[gerar-santo-do-dia] Santo já existe para ${day}/${month}: ${existing.name}`);
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            message: `Santo ${existing.name} já estava cadastrado para ${day}/${month}.`,
            saint: existing
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // 2. Gera dados do santo via IA
    console.log(`[gerar-santo-do-dia] Gerando santo para ${day}/${month}...`);
    const saintData = await chamarIASanto(month, day, dateISO);

    // 3. Pipeline de imagem
    const imageUrl = await gerarEFazerUploadImagem(
      saintData.image_prompt || `Catholic saint portrait, religious art, ${saintData.name}`,
      slugify(saintData.name)
    );

    // 4. Monta payload compatível com schema real da tabela saints
    const slug = slugify(saintData.name ?? `santo-${month}-${day}`);
    const payload = {
      slug,
      name: saintData.name ?? "Santo do Dia",
      title: saintData.title ?? "Santo",
      category: saintData.category ?? "Confessor",
      feast_month: month,
      feast_day: day,
      feast_date: dateISO,
      short_bio: saintData.short_bio ?? "",
      full_bio: saintData.full_bio ?? "",
      summary: saintData.summary ?? "",
      patronage: saintData.patronage ?? "Igreja Católica",
      prayer: saintData.prayer ?? null,
      quotes: saintData.quotes?.filter(Boolean)?.length ? saintData.quotes.filter(Boolean) : null,
      image_url: imageUrl,
      featured: true,
      updated_at: new Date().toISOString()
    };

    console.log(`[gerar-santo-do-dia] Upserting "${payload.name}" (slug: ${slug}) no banco...`);

    // 5. Upsert no banco (conflito por slug)
    const { data: saved, error: upsertErr } = await supabase
      .from("saints")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (upsertErr) throw new Error(`Erro no upsert do santo: ${upsertErr.message}`);

    const elapsed = Date.now() - startTime;
    console.log(`[gerar-santo-do-dia] ✓ ${payload.name} salvo com sucesso em ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        date: dateISO,
        elapsed_ms: elapsed,
        saint: saved
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[gerar-santo-do-dia] ERRO:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
