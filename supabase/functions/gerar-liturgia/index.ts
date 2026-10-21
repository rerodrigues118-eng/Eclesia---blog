// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR LITURGIA DIÁRIA
// Integração: Gemini AI + PostgreSQL (tabela daily_liturgy)
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function todayBRT(): string {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brt.toISOString().split("T")[0];
}

async function geminiGenerate(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    })
  });
  if (!res.ok) throw new Error(`Gemini falhou: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetDate = url.searchParams.get("date") ?? todayBRT();
    const force = url.searchParams.get("force") === "true";

    // Verifica se já existe liturgia para esta data
    if (!force) {
      const { data: existing } = await supabase
        .from("daily_liturgy")
        .select("id, date")
        .eq("date", targetDate)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ success: true, message: `Liturgia de ${targetDate} já existe.`, id: existing.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const prompt = `Você é um teólogo católico especialista em liturgia romana.
Gere a Liturgia da Palavra para o dia ${targetDate} do calendário litúrgico romano.
Responda SOMENTE com JSON válido no formato:
{
  "date": "${targetDate}",
  "liturgical_season": "Tempo Comum",
  "title": "Título descritivo do dia litúrgico",
  "first_reading": { "book": "Nome do livro", "reference": "Cap:Ver", "text": "Texto completo da leitura..." },
  "psalm": { "reference": "Sl XX", "response": "Versículo de resposta", "text": "Estrofes do salmo..." },
  "second_reading": null,
  "gospel_acclamation": "Versículo da aclamação",
  "gospel": { "book": "Jo|Mt|Mc|Lc", "reference": "Cap:Ver", "text": "Texto completo do Evangelho..." },
  "reflection": "Reflexão meditativa em 3 parágrafos sobre a mensagem central do dia..."
}`;

    const raw = await geminiGenerate(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini não retornou JSON válido para Liturgia");
    const liturgy = JSON.parse(jsonMatch[0]);

    const { data, error } = await supabase
      .from("daily_liturgy")
      .upsert({
        date: targetDate,
        title: liturgy.title ?? `Liturgia da Palavra — ${targetDate}`,
        liturgical_season: liturgy.liturgical_season ?? "Tempo Comum",
        first_reading: liturgy.first_reading ?? null,
        psalm: liturgy.psalm ?? null,
        second_reading: liturgy.second_reading ?? null,
        gospel_acclamation: liturgy.gospel_acclamation ?? null,
        gospel: liturgy.gospel ?? null,
        reflection: liturgy.reflection ?? null,
        updated_at: new Date().toISOString()
      }, { onConflict: "date" })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, date: targetDate, liturgy: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[gerar-liturgia]", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
