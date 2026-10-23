/**
 * ============================================================
 * ECLESIA CRONS — Cloudflare Worker Autônomo
 * Executa todas as automações diárias do blog eclesia.blog
 * Linha Editorial: 2 Formações Teológicas + 2 Notícias em Alta (RSS/Web)
 * Curadoria de Imagens Sacras 100% Autênticas e Católicas
 * ============================================================
 *
 * Cron Triggers (wrangler.toml):
 *   0 6 * * *    → Liturgia Diária + Santo do Dia (03:00 BRT)
 *   0 9 * * *    → Artigo Slot 1: Espiritualidade & Oração (06:00 BRT)
 *   30 13 * * *  → Artigo Slot 2: Teologia & Doutrina (10:30 BRT)
 *   0 18 * * *   → Artigo Slot 3: Notícia Vaticano / Santa Sé (15:00 BRT)
 *   30 22 * * *  → Artigo Slot 4: Notícia Igreja no Brasil / Juventude (19:30 BRT)
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
// Dicionário de Imagens Sacras Seguras (100% Católicas)
// ────────────────────────────────────────────────────────────
const IMAGENS_SEGURAS: Record<string, string> = {
  vaticano: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&q=80&w=1200',
  teologia: 'https://images.unsplash.com/photo-1548625361-195979bc7583?auto=format&fit=crop&q=80&w=1200',
  espiritualidade: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
  juventude: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=1200',
  liturgia: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
  santos: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200'
};

const TERMOS_PROIBIDOS = [
  'mosque', 'mesquita', 'pagoda', 'pagode', 'hindu', 'buddhist', 'buda', 'buddha',
  'temple', 'shrine', 'crowd', 'skyline', 'skyscraper', 'prédios', 'islam', 'mecca', 'medina'
];

const BLACKLIST_UNSPLASH_IDS = [
  'photo-1519817650390', // Mesquita
  'photo-1544644181',    // Pagode/Templo oriental
  'photo-1519491050282'  // Genérica não-católica
];

function validarImagemSegura(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  if (!u.startsWith('http://') && !u.startsWith('https://')) return false;
  for (const bid of BLACKLIST_UNSPLASH_IDS) {
    if (u.includes(bid)) return false;
  }
  for (const term of TERMOS_PROIBIDOS) {
    if (u.includes(term)) return false;
  }
  return true;
}

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
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    })
  });
  if (!res.ok) throw new Error(`Gemini API falhou: ${res.status} ${await res.text()}`);
  const json: any = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ────────────────────────────────────────────────────────────
// Helper: RSS Feeds Católicos (Vatican News, ACI, CNBB, Canção Nova)
// ────────────────────────────────────────────────────────────
interface NoticiaRSS {
  titulo: string;
  resumo: string;
  link: string;
  imagemUrl?: string;
  fonte: string;
}

async function buscarNoticiasCatolicasRSS(): Promise<NoticiaRSS[]> {
  const feeds = [
    { nome: 'Vatican News PT', url: 'https://www.vaticannews.va/pt.rss.xml' },
    { nome: 'ACI Digital', url: 'https://feeds.feedburner.com/acidigital' },
    { nome: 'CNBB', url: 'https://www.cnbb.org.br/feed/' },
    { nome: 'Canção Nova', url: 'https://noticias.cancaonova.com/feed/' }
  ];

  const noticias: NoticiaRSS[] = [];
  for (const f of feeds) {
    try {
      const res = await fetch(f.url, {
        headers: { 'User-Agent': 'EclesiaCron/2.0' }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
      for (let i = 0; i < Math.min(items.length, 3); i++) {
        const item = items[i];
        const rawTitle = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i) || [])[1] || '';
        const rawLink = (item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || [])[1] || '';
        const rawDesc = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || [])[1] || '';
        
        const encMatch = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
        const medMatch = item.match(/<media:content[^>]+url=["']([^"']+)["']/i);
        const candImg = encMatch?.[1] || medMatch?.[1];

        const titulo = rawTitle.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
        const resumo = rawDesc.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

        if (titulo && titulo.length > 15) {
          noticias.push({
            titulo,
            resumo: resumo.slice(0, 250),
            link: rawLink.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim(),
            imagemUrl: validarImagemSegura(candImg) ? candImg : undefined,
            fonte: f.nome
          });
        }
      }
    } catch (e) {
      console.warn(`[Cron RSS] Erro ao ler ${f.nome}:`, e);
    }
  }
  return noticias;
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
  const brtHours = new Date(Date.now() - 3 * 60 * 60 * 1000).getUTCHours();
  if (brtHours >= 5 && brtHours < 10) return 1;
  if (brtHours >= 10 && brtHours < 14) return 2;
  if (brtHours >= 14 && brtHours < 18) return 3;
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
  "image_url": "${IMAGENS_SEGURAS.santos}"
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
    image_url: IMAGENS_SEGURAS.santos,
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
// AUTOMAÇÃO 3: Artigo Diário (Linha 2 Formações + 2 Notícias)
// ────────────────────────────────────────────────────────────
async function runArtigo(env: Env, slot: number): Promise<void> {
  const date = todayBRT();
  let category = 'Espiritualidade';
  let defaultCover = IMAGENS_SEGURAS.espiritualidade;
  let isTrending = false;
  let promptTema = '';

  // Slot 1: Formação Espiritual & Oração (50% Formação)
  if (slot === 1) {
    category = 'Espiritualidade';
    defaultCover = IMAGENS_SEGURAS.espiritualidade;
    promptTema = `Tema de Formação Espiritual: Vida de oração matinal, Santa Missa diária, adoração e silêncio interior com Cristo.`;
  }
  // Slot 2: Formação Teológica & Doutrina (50% Formação)
  else if (slot === 2) {
    category = 'Teologia';
    defaultCover = IMAGENS_SEGURAS.teologia;
    promptTema = `Tema de Formação Teológica: A centralidade da Eucaristia, Catecismo da Igreja Católica, sacramentos e a sabedoria dos Doutores da Igreja.`;
  }
  // Slot 3: Notícia em Alta 1 - Vaticano & Santa Sé (50% Notícias)
  else if (slot === 3) {
    category = 'Vaticano';
    defaultCover = IMAGENS_SEGURAS.vaticano;
    isTrending = true;
    const noticias = await buscarNoticiasCatolicasRSS();
    const noticia = noticias.find(n => n.fonte.includes('Vatican') || n.titulo.toLowerCase().includes('papa')) || noticias[0];
    if (noticia) {
      if (noticia.imagemUrl) defaultCover = noticia.imagemUrl;
      promptTema = `Notícia em alta da Santa Sé: "${noticia.titulo}". Fato: ${noticia.resumo}. Analise o impacto pastoral e teológico para os fiéis.`;
    } else {
      promptTema = `Notícia em alta da Santa Sé: As recentes declarações papais e as diretrizes do Vaticano para a paz e a dignidade humana.`;
    }
  }
  // Slot 4: Notícia em Alta 2 - Igreja no Brasil & Juventude (50% Notícias)
  else {
    category = 'Juventude & Fé';
    defaultCover = IMAGENS_SEGURAS.juventude;
    isTrending = true;
    const noticias = await buscarNoticiasCatolicasRSS();
    const noticia = noticias.find(n => n.fonte.includes('CNBB') || n.fonte.includes('Canção Nova')) || noticias[1] || noticias[0];
    if (noticia) {
      if (noticia.imagemUrl) defaultCover = noticia.imagemUrl;
      promptTema = `Notícia em alta da Igreja e Missão: "${noticia.titulo}". Fato: ${noticia.resumo}. Inspire os jovens cristãos a viverem o Evangelho com coragem.`;
    } else {
      promptTema = `Notícia e atualidade da Igreja: A juventude católica diante dos desafios culturais, a herança de Carlo Acutis e a missão evangelizadora.`;
    }
  }

  console.log(`[Eclesia Cron] Artigo Slot ${slot} (${category}) — Data: ${date}`);

  const prompt = `Você é um renomado jornalista e teólogo católico. 
Escreva um artigo primoroso e inspirador para o portal Eclesia (eclesia.blog).
${promptTema}
Data de hoje: ${date}.
Critérios:
1. "title": Entre 38 e 63 caracteres, atraente e fiel à fé.
2. "excerpt": Entre 120 e 160 caracteres.
3. "content": Artigo completo em Markdown rico (mínimo 700 palavras) com subtítulos "##", citações ">" e bloco de oração católico ao fim: [ORACAO: Título] ... [/ORACAO].

Responda SOMENTE com JSON válido:
{
  "title": "Título impactante (38-63 caracteres)",
  "subtitle": "Subtítulo explicativo",
  "category": "${category}",
  "tags": ["Fé Católica", "Igreja Católica"],
  "excerpt": "Resumo entre 120 e 160 caracteres",
  "content": "Artigo completo em Markdown rico...",
  "read_time_minutes": 6,
  "seo_title": "Título SEO otimizado",
  "seo_description": "Meta description com 155 caracteres"
}`;

  const raw = await geminiGenerate(env, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Gemini não retornou JSON válido para Artigo Slot ${slot}`);
  const article = JSON.parse(jsonMatch[0]);

  // Garante que o slug é gerado estritamente a partir do título do artigo
  const slug = slugify(article.title);

  await supabaseUpsert(env, 'articles', {
    slug,
    title: article.title,
    subtitle: article.subtitle || null,
    category: article.category || category,
    tags: article.tags || ['Fé Católica'],
    excerpt: article.excerpt || '',
    content: article.content || '',
    cover_image: defaultCover,
    read_time: article.read_time_minutes || 6,
    seo_title: article.seo_title || article.title,
    seo_description: article.seo_description || article.excerpt,
    status: 'published',
    trending: isTrending,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    auto_generated: true,
    slot
  }, 'slug');

  await notifyIndexNow([`${SITE_URL}/blog/${slug}`, `${SITE_URL}/blog`, `${SITE_URL}/sitemap.xml`]);
  console.log(`[Eclesia Cron] Artigo Slot ${slot} "${article.title}" publicado.`);
}

// ────────────────────────────────────────────────────────────
// Helper: IndexNow
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
    console.warn('[IndexNow] Falha na notificação:', e);
  }
}

// ────────────────────────────────────────────────────────────
// CLOUDFLARE WORKER EXPORT
// ────────────────────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const secret = req.headers.get('x-cron-secret') || url.searchParams.get('secret');

    if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
      return new Response('Não autorizado', { status: 401 });
    }

    const path = url.pathname;
    try {
      if (path === '/liturgia') { await runLiturgia(env); return Response.json({ ok: true, task: 'liturgia' }); }
      if (path === '/santo')    { await runSanto(env);    return Response.json({ ok: true, task: 'santo' }); }
      if (path.startsWith('/artigo')) {
        const slot = parseInt(url.searchParams.get('slot') || String(inferSlotFromHour()));
        await runArtigo(env, slot);
        return Response.json({ ok: true, task: 'artigo', slot });
      }
      return Response.json({ ok: true, message: 'Eclesia Cron Worker ativo: /liturgia, /santo, /artigo?slot=1-4' });
    } catch (err: any) {
      console.error('[Eclesia Cron Error]', err);
      return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    console.log(`[Eclesia Scheduled] Cron: ${cron} | ${new Date().toISOString()}`);

    switch (cron) {
      case '0 6 * * *':
        ctx.waitUntil(Promise.allSettled([runLiturgia(env), runSanto(env)]));
        break;
      case '0 9 * * *':   ctx.waitUntil(runArtigo(env, 1)); break;
      case '30 13 * * *': ctx.waitUntil(runArtigo(env, 2)); break;
      case '0 18 * * *':  ctx.waitUntil(runArtigo(env, 3)); break;
      case '30 22 * * *': ctx.waitUntil(runArtigo(env, 4)); break;
      default:
        console.warn(`[Eclesia Scheduled] Cron não mapeado: ${cron}`);
    }
  }
};
