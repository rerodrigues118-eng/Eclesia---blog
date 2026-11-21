// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR LITURGIA DIÁRIA
// Conforme o Missal Romano / Lecionário da CNBB (Rito Romano)
// Modelos: Groq (Llama-3.3 / GPT-OSS) + Fallback Google Gemini 2.0 Flash
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
const GROK_API_KEY = Deno.env.get("GROK_API_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getTodayBRT(): string {
  try {
    const brStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const [d, m, y] = brStr.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  } catch {
    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    return brt.toISOString().split("T")[0];
  }
}

async function chamarIA(promptSistema: string, promptUsuario: string): Promise<string> {
  const isGroq = GROK_API_KEY.startsWith("gsk_");
  const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
  const modelos = isGroq
    ? ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]
    : ["grok-2-latest"];

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
            { role: "system", content: promptSistema + "\nATENÇÃO: Retorne APENAS um objeto JSON válido, sem texto conversacional antes ou depois." },
            { role: "user", content: promptUsuario }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 4000
        })
      });

      if (!res.ok) {
        console.warn(`[gerar-liturgia] Aviso: Modelo ${modelo} falhou com status ${res.status}`);
        continue;
      }

      const json = await res.json();
      let text: string = json.choices?.[0]?.message?.content ?? "";
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
      if (text) return text;
    } catch (e: any) {
      console.warn(`[gerar-liturgia] Exceção no modelo ${modelo}:`, e.message);
    }
  }

  // Fallback Gemini
  if (GEMINI_API_KEY) {
    console.log("[gerar-liturgia] Usando fallback Gemini 2.0 Flash...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${promptSistema}\n\n${promptUsuario}\nRetorne EXCLUSIVAMENTE um objeto JSON válido.` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
      })
    });
    if (res.ok) {
      const json = await res.json();
      let text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
      if (text) return text;
    }
  }

  throw new Error("Falha em todos os provedores de IA para gerar a Liturgia.");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let targetDate = getTodayBRT();
    let force = false;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.date) targetDate = body.date;
        if (body.force) force = Boolean(body.force);
      } catch {
        // corpo vazio
      }
    } else {
      const url = new URL(req.url);
      targetDate = url.searchParams.get("date") ?? getTodayBRT();
      force = url.searchParams.get("force") === "true";
    }

    // Se já existe e não for force, retorna o registro existente
    if (!force) {
      const { data: existing, error: selectErr } = await supabase
        .from("daily_liturgy")
        .select("*")
        .eq("date", targetDate)
        .maybeSingle();

      if (!selectErr && existing) {
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            message: `Liturgia de ${targetDate} já está cadastrada.`,
            liturgy: existing
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    console.log(`[gerar-liturgia] Gerando Liturgia Diária oficial para a data: ${targetDate}...`);

    const promptSistema = `Você é um teólogo e liturgista oficial da Igreja Católica especialista no Calendário Litúrgico Romano da CNBB (Conferência Nacional dos Bispos do Brasil).
Sua missão é fornecer os textos canônicos e fiéis da Liturgia da Palavra (Primeira Leitura, Salmo Responsorial, Segunda Leitura quando for domingo ou solenidade, e Santo Evangelho) para a data solicitada.`;

    const promptUsuario = `Gere a Liturgia da Palavra completa da Igreja Católica para a data ${targetDate}.
Retorne rigorosamente no seguinte formato JSON (sem campos adicionais):
{
  "liturgical_season": "Tempo Comum | Advento | Natal | Quaresma | Páscoa",
  "liturgical_color": "Verde | Roxo | Branco | Vermelho | Rosa",
  "color_hex": "#1c5d3a | #6d28d9 | #c7a84a | #b91c1c | #db2777",
  "full_date_str": "Título canônico do dia litúrgico (ex: Sexta-feira da 33ª Semana do Tempo Comum)",
  "first_reading": {
    "title": "Primeira Leitura",
    "reference": "Referência bíblica precisa (ex: Ap 10, 8-11)",
    "rubric": "Rubrica litúrgica de proclamação (ex: Leitura do Livro do Apocalipse de São João)",
    "text": [
      "Parágrafo 1 do texto sagrado...",
      "Parágrafo 2 do texto sagrado..."
    ],
    "response": "— Palavra do Senhor. / Graças a Deus."
  },
  "psalm": {
    "reference": "Referência do Salmo (ex: Sl 118(119), 14.24.72.103.111.131 (R. 103a))",
    "antiphon": "Refrão do Salmo cantado pela assembleia",
    "stanzas": [
      "Estrofe 1 do Salmo...",
      "Estrofe 2 do Salmo..."
    ]
  },
  "second_reading": null,
  "gospel": {
    "reference": "Referência do Evangelho (ex: Lc 19, 45-48)",
    "dialogue": {
      "lordBeWithYou": "— O Senhor esteja convosco.",
      "andWithYourSpirit": "— Ele está no meio de nós.",
      "gospelProclamation": "— Proclamação do Evangelho de Jesus Cristo segundo Lucas.",
      "gloryToYou": "— Glória a vós, Senhor."
    },
    "acclamation": "Versículo de aclamação ao Evangelho",
    "text": [
      "Naquele tempo, disse Jesus...",
      "Continuação do texto evangélico..."
    ],
    "praise": "— Palavra da Salvação. / Glória a vós, Senhor."
  }
}`;

    const jsonString = await chamarIA(promptSistema, promptUsuario);
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      console.error("[gerar-liturgia] Erro ao decodificar JSON:", jsonString);
      throw new Error("A IA não retornou um JSON litúrgico válido.");
    }

    const payloadDb = {
      date: targetDate,
      liturgical_season: parsed.liturgical_season || "Tempo Comum",
      liturgical_color: parsed.liturgical_color || "Verde",
      color_hex: parsed.color_hex || "#1c5d3a",
      full_date_str: parsed.full_date_str || `Liturgia de ${targetDate}`,
      first_reading: parsed.first_reading || {},
      psalm: parsed.psalm || {},
      second_reading: parsed.second_reading || null,
      gospel: parsed.gospel || {},
      source: "CNBB / Liturgia Diária Oficial",
      inserted_manually: false,
      created_at: new Date().toISOString()
    };

    const { data: saved, error } = await supabase
      .from("daily_liturgy")
      .upsert(payloadDb, { onConflict: "date" })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao salvar liturgia no Postgres: ${error.message}`);
    }

    console.log(`[gerar-liturgia] Liturgia de ${targetDate} gravada com sucesso no Postgres!`);

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        message: `Liturgia de ${targetDate} salva com sucesso no banco de dados.`,
        liturgy: saved
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: any) {
    console.error("[gerar-liturgia] Erro:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
