/**
 * ============================================================
 * ECLESIA CRONS — Cloudflare Worker Autônomo
 * Executa todas as automações diárias do blog eclesia.blog
 * ============================================================
 *
 * Cron Triggers (wrangler.toml):
 *   0 6 * * *    → Liturgia Diária    (03:00 BRT)
 *   5 6 * * *    → Santo do Dia       (03:05 BRT)
 *   0 9 * * *    → Artigo Slot 1      (06:00 BRT)
 *   30 13 * * *  → Artigo Slot 2      (10:30 BRT)
 *   0 18 * * *   → Artigo Slot 3      (15:00 BRT)
 *   30 22 * * *  → Artigo Slot 4      (19:30 BRT)
 */

export interface Env {
  VITE_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  VITE_SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY: string;
  GROK_API_KEY: string;
  CRON_SECRET: string;
}

const SITE_URL = 'https://eclesia.blog';

// ────────────────────────────────────────────────────────────
// Helpers: Supabase REST via fetch (sem SDK, funciona no CF)
// ────────────────────────────────────────────────────────────
function supabaseHeaders(env: Env) {
  return {
    'Content-Type': 'application/json',
    'apikey': env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY}`,
    'Prefer': 'return=representation'
  };
}

async function supabaseUpsert(env: Env, table: string, data: Record<string, unknown>, onConflict?: string) {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...supabaseHeaders(env), 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Supabase upsert [${table}] falhou: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabaseSelect(env: Env, table: string, query: string) {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, { headers: supabaseHeaders(env) });
  if (!res.ok) throw new Error(`Supabase select [${table}] falhou: ${res.status}`);
  return res.json();
}

// ────────────────────────────────────────────────────────────
// Helper: Gemini API via fetch
// ────────────────────────────────────────────────────────────
async function geminiGenerate(env: Env, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
    })
  });
  if (!res.ok) throw new Error(`Gemini API falhou: ${res.status} ${await res.text()}`);
  const json: any = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ────────────────────────────────────────────────────────────
// Helper: Data de hoje no fuso BRT (UTC-3)
// ────────────────────────────────────────────────────────────
function todayBRT(): string {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brt.toISOString().split('T')[0]; // YYYY-MM-DD
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function inferSlotFromHour(): number {
  const utcHours = new Date().getUTCHours();
  if (utcHours >= 6  && utcHours < 12) return 1;
  if (utcHours >= 12 && utcHours < 16) return 2;
  if (utcHours >= 16 && utcHours < 21) return 3;
  return 4;
}

// ────────────────────────────────────────────────────────────
// AUTOMAÇÃO 1: Liturgia Diária
// ────────────────────────────────────────────────────────────
async function runLiturgia(env: Env): Promise<void> {
  const date = todayBRT();
  console.log(`[Eclesia Cron] Liturgia Diária — ${date}`);

  const prompt = `Você é um teólogo católico especialista em liturgia. 
Gere a Liturgia da Palavra para o dia ${date} no formato JSON.
Inclua: primeira leitura, salmo responsorial, segunda leitura (se houver), aclamação ao Evangelho e Evangelho do dia.
Adicione uma breve reflexão meditativa de 3 parágrafos sobre a mensagem central.
Responda SOMENTE com JSON válido no formato:
{
  "date": "${date}",
  "liturgical_season": "Tempo Comum",
  "title": "Título da liturgia do dia",
  "first_reading": { "book": "...", "reference": "...", "text": "..." },
  "psalm": { "reference": "...", "response": "...", "text": "..." },
  "second_reading": null,
  "gospel_acclamation": "...",
  "gospel": { "book": "...", "reference": "...", "text": "..." },
  "reflection": "Reflexão meditativa em 3 parágrafos..."
}`;

  const raw = await geminiGenerate(env, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini não retornou JSON válido para Liturgia');
  const liturgy = JSON.parse(jsonMatch[0]);

  await supabaseUpsert(env, 'daily_liturgy', {
    date,
    title: liturgy.title || `Liturgia da Palavra — ${date}`,
    liturgical_season: liturgy.liturgical_season || 'Tempo Comum',
    first_reading: liturgy.first_reading || null,
    psalm: liturgy.psalm || null,
    second_reading: liturgy.second_reading || null,
    gospel_acclamation: liturgy.gospel_acclamation || null,
    gospel: liturgy.gospel || null,
    reflection: liturgy.reflection || null,
    updated_at: new Date().toISOString()
  }, 'date');

  // Notifica IndexNow
  await notifyIndexNow([`${SITE_URL}/liturgia`]);
  console.log(`[Eclesia Cron] Liturgia ${date} publicada com sucesso.`);
}

// ────────────────────────────────────────────────────────────
// AUTOMAÇÃO 2: Santo do Dia
// ────────────────────────────────────────────────────────────
async function runSanto(env: Env): Promise<void> {
  const date = todayBRT();
  console.log(`[Eclesia Cron] Santo do Dia — ${date}`);

  const prompt = `Você é um hagiógrafo católico especialista em santoral.
Escreva um perfil detalhado do Santo ou Santos do dia ${date} do calendário litúrgico romano.
Responda SOMENTE com JSON válido:
{
  "name": "Nome completo do Santo",
  "feast_date": "${date}",
  "birth_year": 1900,
  "death_year": 1960,
  "origin_country": "País de origem",
  "category": "Mártir | Confessor | Virgem | Papa | Doutor | etc",
  "short_description": "Descrição curta de 1 parágrafo",
  "biography": "Biografia completa em 4-6 parágrafos detalhados",
  "patronage": "Padroeiro de...",
  "prayer": "Oração própria ao santo",
  "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200"
}`;

  const raw = await geminiGenerate(env, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini não retornou JSON válido para Santo');
  const saint = JSON.parse(jsonMatch[0]);
  const slug = slugify(saint.name || `santo-${date}`);

  await supabaseUpsert(env, 'saints', {
    slug,
    name: saint.name,
    feast_date: date,
    birth_year: saint.birth_year || null,
    death_year: saint.death_year || null,
    origin_country: saint.origin_country || null,
    category: saint.category || 'Confessor',
    short_description: saint.short_description || '',
    biography: saint.biography || '',
    patronage: saint.patronage || null,
    prayer: saint.prayer || null,
    image_url: saint.image_url || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    is_today: true,
    updated_at: new Date().toISOString()
  }, 'slug');

  // Zera is_today dos outros
  await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/saints?slug=neq.${slug}`, {
    method: 'PATCH',
    headers: supabaseHeaders(env),
    body: JSON.stringify({ is_today: false })
  });

  await notifyIndexNow([`${SITE_URL}/santoral`, `${SITE_URL}/santoral/${slug}`]);
  console.log(`[Eclesia Cron] Santo "${saint.name}" publicado com sucesso.`);
}

// ────────────────────────────────────────────────────────────
// AUTOMAÇÃO 3: Artigo Diário (4 slots)
// ────────────────────────────────────────────────────────────
const SLOT_THEMES: Record<number, string> = {
  1: 'Espiritualidade e vida de oração, Eucaristia, Liturgia das Horas',
  2: 'Doutrina Católica, Magistério, Santos e sua vida exemplar',
  3: 'Família cristã, educação dos filhos, virtudes cotidianas',
  4: 'Evangelização, missão, cultura católica e atualidade eclesial'
};

async function runArtigo(env: Env, slot: number): Promise<void> {
  const date = todayBRT();
  const theme = SLOT_THEMES[slot] || SLOT_THEMES[1];
  console.log(`[Eclesia Cron] Artigo Slot ${slot} — Tema: ${theme}`);

  const prompt = `Você é um jornalista e teólogo católico de alto nível. 
Escreva um artigo completo, rico e edificante sobre o tema: "${theme}".
Data de hoje: ${date}. Este é o artigo do slot ${slot} do dia.

Responda SOMENTE com JSON válido:
{
  "title": "Título impactante do artigo (máximo 80 caracteres)",
  "subtitle": "Subtítulo explicativo (máximo 120 caracteres)",
  "category": "Espiritualidade | Doutrina | Família | Evangelização",
  "tags": ["tag1", "tag2", "tag3"],
  "excerpt": "Resumo em 2 frases que desperte curiosidade",
  "content": "Artigo completo em HTML com tags <h2>, <h3>, <p>, <blockquote>. Mínimo 1200 palavras, citações bíblicas, reflexão teológica profunda e aplicação prática à vida cristã.",
  "image_url": "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200",
  "read_time_minutes": 7,
  "seo_title": "Título SEO otimizado",
  "seo_description": "Meta description com 155 caracteres"
}`;

  const raw = await geminiGenerate(env, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Gemini não retornou JSON válido para Artigo Slot ${slot}`);
  const article = JSON.parse(jsonMatch[0]);
  const slug = `${slugify(article.title)}-${date}-slot${slot}`;

  await supabaseUpsert(env, 'articles', {
    slug,
    title: article.title,
    subtitle: article.subtitle || null,
    category: article.category || 'Espiritualidade',
    tags: article.tags || [],
    excerpt: article.excerpt || '',
    content: article.content || '',
    cover_image: article.image_url || 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&q=80&w=1200',
    read_time: article.read_time_minutes || 7,
    seo_title: article.seo_title || article.title,
    seo_description: article.seo_description || article.excerpt,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    auto_generated: true,
    slot
  }, 'slug');

  await notifyIndexNow([`${SITE_URL}/blog/${slug}`, `${SITE_URL}/blog`, `${SITE_URL}/sitemap.xml`]);
  console.log(`[Eclesia Cron] Artigo Slot ${slot} "${article.title}" publicado.`);
}

// ────────────────────────────────────────────────────────────
// Helper: IndexNow (notificação a Google/Bing/Yandex)
// ────────────────────────────────────────────────────────────
async function notifyIndexNow(urls: string[]): Promise<void> {
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'eclesia.blog',
        key: 'eclesia-indexnow-key',
        urlList: urls
      })
    });
  } catch (e) {
    console.warn('[IndexNow] Falha na notificação (não crítico):', e);
  }
}

// ────────────────────────────────────────────────────────────
// CLOUDFLARE WORKER EXPORT
// ────────────────────────────────────────────────────────────
export default {
  // HTTP: permite disparo manual via URL protegida
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const secret = req.headers.get('x-cron-secret') || url.searchParams.get('secret');

    if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
      return new Response('Não autorizado', { status: 401 });
    }

    const path = url.pathname;
    try {
      if (path === '/liturgia')        { await runLiturgia(env); return Response.json({ ok: true, task: 'liturgia' }); }
      if (path === '/santo')           { await runSanto(env);    return Response.json({ ok: true, task: 'santo' }); }
      if (path.startsWith('/artigo'))  {
        const slot = parseInt(url.searchParams.get('slot') || String(inferSlotFromHour()));
        await runArtigo(env, slot);
        return Response.json({ ok: true, task: 'artigo', slot });
      }
      return Response.json({ ok: true, message: 'Eclesia Cron Worker ativo. Rotas: /liturgia /santo /artigo?slot=1-4' });
    } catch (err: any) {
      console.error('[Eclesia Cron Error]', err);
      return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
  },

  // SCHEDULED: Cron Triggers automáticos do Cloudflare
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    console.log(`[Eclesia Scheduled] Cron: ${cron} | ${new Date().toISOString()}`);

    switch (cron) {
      // Liturgia + Santo em paralelo às 03:00 BRT — economiza 1 trigger (limite Free = 5)
      case '0 6 * * *':
        ctx.waitUntil(Promise.allSettled([runLiturgia(env), runSanto(env)]));
        break;
      case '0 9 * * *':   ctx.waitUntil(runArtigo(env, 1)); break;
      case '30 13 * * *': ctx.waitUntil(runArtigo(env, 2)); break;
      case '0 18 * * *':  ctx.waitUntil(runArtigo(env, 3)); break;
      case '30 22 * * *': ctx.waitUntil(runArtigo(env, 4)); break;
      default:
        console.warn(`[Eclesia Scheduled] Cron nao mapeado: ${cron}`);
    }
  }
};
