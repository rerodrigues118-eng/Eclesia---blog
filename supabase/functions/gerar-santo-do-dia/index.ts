// ============================================================================
// ECLESIA BLOG CATÓLICO - SUPABASE EDGE FUNCTION: GERAR SANTO DO DIA
// Integração: Gemini AI + PostgreSQL (tabela saints)
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function geminiGenerate(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
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
    const date = todayBRT();

    const prompt = `Você é um hagiógrafo católico especialista no santoral romano.
Escreva um perfil completo e edificante do Santo ou Santos comemorados em ${date} no Calendário Litúrgico Romano.
Responda SOMENTE com JSON válido:
{
  "name": "Nome completo do Santo",
  "feast_date": "${date}",
  "birth_year": 1850,
  "death_year": 1922,
  "origin_country": "País de origem",
  "category": "Mártir | Confessor | Virgem | Papa | Doutor | Bispo | Religioso | Leigo",
  "short_description": "Descrição curta de 1 parágrafo impactante",
  "biography": "Biografia completa em 5-7 parágrafos ricos e detalhados com contexto histórico e espiritual",
  "patronage": "Padroeiro de... (ou null)",
  "prayer": "Oração própria ao santo para ser rezada pelos fiéis",
  "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200"
}`;

    const raw = await geminiGenerate(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini não retornou JSON válido para Santo");
    const saint = JSON.parse(jsonMatch[0]);
    const slug = slugify(saint.name ?? `santo-${date}`);

    // Marca is_today = false em todos os outros santos
    await supabase
      .from("saints")
      .update({ is_today: false })
      .neq("slug", slug);

    // Upsert do santo do dia
    const { data, error } = await supabase
      .from("saints")
      .upsert({
        slug,
        name: saint.name,
        feast_date: date,
        birth_year: saint.birth_year ?? null,
        death_year: saint.death_year ?? null,
        origin_country: saint.origin_country ?? null,
        category: saint.category ?? "Confessor",
        short_description: saint.short_description ?? "",
        biography: saint.biography ?? "",
        patronage: saint.patronage ?? null,
        prayer: saint.prayer ?? null,
        image_url: saint.image_url ?? "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200",
        status: "published",
        is_today: true,
        updated_at: new Date().toISOString()
      }, { onConflict: "slug" })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, date, saint: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[gerar-santo-do-dia]", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
