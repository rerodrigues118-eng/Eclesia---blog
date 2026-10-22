// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR LITURGIA DIÁRIA
// Integração: Groq / Qwen + Supabase (Tabela daily_liturgy)
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function todayBRT(): string {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brt.toISOString().split("T")[0];
}

async function chamarGroq(promptSistema: string, promptUsuario: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: promptSistema + "\nATENÇÃO: Retorne APENAS um objeto JSON válido, sem texto conversacional antes ou depois." },
        { role: "user", content: promptUsuario }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API falhou (${response.status}): ${err}`);
  }

  const json = await response.json();
  let text: string = json.choices?.[0]?.message?.content ?? "";
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  }
  return text;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let targetDate = todayBRT();
    let force = false;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.date) targetDate = body.date;
        if (body.force) force = Boolean(body.force);
      } catch {
        // ignora se corpo vazio
      }
    } else {
      const url = new URL(req.url);
      targetDate = url.searchParams.get("date") ?? todayBRT();
      force = url.searchParams.get("force") === "true";
    }

    // Se já existe e não for force, retorna registro existente
    if (!force) {
      const { data: existing } = await supabase
        .from("daily_liturgy")
        .select("*")
        .eq("date", targetDate)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ success: true, message: `Liturgia de ${targetDate} já cadastrada.`, liturgy: existing }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const promptSistema = `Você é um teólogo e liturgista católico oficial da Igreja Romana.
Sua missão é fornecer os textos exatos da Liturgia da Palavra para o dia no rito romano (calendário litúrgico da CNBB).`;

    const promptUsuario = `Gere a Liturgia da Palavra completa para o dia ${targetDate}.
Retorne estritamente um JSON no seguinte formato:
{
  "liturgical_season": "Tempo Comum",
  "liturgical_color": "Verde",
  "color_hex": "#1c5d3a",
  "full_date_str": "Quinta-feira da 29ª Semana do Tempo Comum",
  "first_reading": {
    "title": "Primeira Leitura",
    "reference": "Ef 3, 14-21",
    "rubric": "Leitura da Carta de São Paulo aos Efésios.",
    "text": [
      "Irmãos: Eu dobro os joelhos diante do Pai...",
      "Que ele vos conceda, segundo a riqueza de sua glória, serdes robustecidos pelo seu Espírito...",
      "A Ele a glória na Igreja e em Cristo Jesus, por todas as gerações dos séculos dos séculos. Amém."
    ],
    "response": "— Palavra do Senhor. / Graças a Deus."
  },
  "psalm": {
    "reference": "Sl 32(33), 1-2.4-5.11-12.18-19 (R. 5b)",
    "antiphon": "Transborda em toda a terra a bondade do Senhor.",
    "stanzas": [
      "Ó justos, alegrai-vos no Senhor! Aos retos fica bem louvá-lo.",
      "Pois reta é a palavra do Senhor, e tudo o que ele faz é digno de fé.",
      "Mas o desígnio do Senhor permanece para sempre, os pensamentos do seu coração de geração em geração."
    ]
  },
  "second_reading": null,
  "gospel": {
    "reference": "Lc 12, 49-53",
    "dialogue": {
      "lordBeWithYou": "— O Senhor esteja convosco.",
      "andWithYourSpirit": "— Ele está no meio de nós.",
      "gospelProclamation": "— Proclamação do Evangelho de Jesus Cristo segundo Lucas.",
      "gloryToYou": "— Glória a vós, Senhor."
    },
    "acclamation": "Aleluia, aleluia, aleluia.",
    "text": [
      "Naquele tempo, disse Jesus aos seus discípulos: 'Eu vim para lançar fogo sobre a terra, e como gostaria que já estivesse aceso!'",
      "'Devo receber um batismo, e como estou ansioso até que ele se cumpra!'",
      "'Pensais que eu vim para trazer a paz sobre a terra? Não, eu vos digo, mas antes a divisão.'"
    ],
    "praise": "— Palavra da Salvação. / Glória a vós, Senhor."
  }
}`;

    const jsonString = await chamarGroq(promptSistema, promptUsuario);
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("[gerar-liturgia] Falha ao fazer parse do JSON:", jsonString);
      throw new Error("Resposta da IA não continha JSON válido.");
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
      inserted_manually: false
    };

    const { data: saved, error } = await supabase
      .from("daily_liturgy")
      .upsert(payloadDb, { onConflict: "date" })
      .select()
      .single();

    if (error) {
      console.error("[gerar-liturgia] Erro ao gravar em daily_liturgy:", error);
      throw new Error(`Erro ao salvar no banco: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Liturgia Diária gravada com sucesso na tabela daily_liturgy (${targetDate})`,
        liturgy: saved
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[gerar-liturgia] Erro:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Erro desconhecido" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
