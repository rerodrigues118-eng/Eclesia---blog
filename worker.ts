/**
 * Cloudflare Worker — Eclesia Blog
 *
 * Responsabilidades:
 *  1. Servir rotas HTTP de cron: GET /api/cron/liturgia | /api/cron/santo | /api/cron/artigo
 *  2. Executar Cron Triggers automáticos do Cloudflare (evento "scheduled")
 *
 * Cron Triggers configurados no wrangler.toml:
 *  - Liturgia:   todo dia às 03h00 BRT (06:00 UTC)
 *  - Santo:      todo dia às 03h05 BRT (06:05 UTC)
 *  - Artigo 1:   todo dia às 06h00 BRT (09:00 UTC)
 *  - Artigo 2:   todo dia às 10h30 BRT (13:30 UTC)
 *  - Artigo 3:   todo dia às 15h00 BRT (18:00 UTC)
 *  - Artigo 4:   todo dia às 19h30 BRT (22:30 UTC)
 */

import { handleLiturgia } from './api/cron/liturgia';
import { handleSanto }    from './api/cron/santo';
import { handleArtigo }   from './api/cron/artigo';

export interface Env {
  CRON_SECRET: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY: string;
}

export default {
  // ──────────────────────────────────────────────
  // 1. HTTP Fetch — Rotas manuais / webhook externo
  // ──────────────────────────────────────────────
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // Injeta variáveis do env do Cloudflare em process.env (compatibilidade)
    if (typeof process !== 'undefined') {
      process.env.CRON_SECRET              = env.CRON_SECRET;
      process.env.VITE_SUPABASE_URL        = env.VITE_SUPABASE_URL;
      process.env.VITE_SUPABASE_ANON_KEY   = env.VITE_SUPABASE_ANON_KEY;
      process.env.GEMINI_API_KEY           = env.GEMINI_API_KEY;
    }

    if (path === '/api/cron/liturgia') return handleLiturgia(req, env as any);
    if (path === '/api/cron/santo')    return handleSanto(req, env as any);
    if (path.startsWith('/api/cron/artigo')) return handleArtigo(req, env as any);

    return new Response('Eclesia Worker: rota nao encontrada.', { status: 404 });
  },

  // ──────────────────────────────────────────────
  // 2. Scheduled — Cron Triggers do Cloudflare
  // ──────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    if (typeof process !== 'undefined') {
      process.env.CRON_SECRET              = env.CRON_SECRET;
      process.env.VITE_SUPABASE_URL        = env.VITE_SUPABASE_URL;
      process.env.VITE_SUPABASE_ANON_KEY   = env.VITE_SUPABASE_ANON_KEY;
      process.env.GEMINI_API_KEY           = env.GEMINI_API_KEY;
    }

    const cron = event.cron;
    console.log(`[CF Scheduled] Cron disparado: ${cron} — ${new Date().toISOString()}`);

    const baseUrl = 'https://eclesia.blog';
    const runWith = (url: string) =>
      new Request(url, { headers: { Authorization: `Bearer ${env.CRON_SECRET}` } });

    switch (cron) {
      case '0 6 * * *':
        ctx.waitUntil(handleLiturgia(runWith(`${baseUrl}/api/cron/liturgia`), env as any));
        break;
      case '5 6 * * *':
        ctx.waitUntil(handleSanto(runWith(`${baseUrl}/api/cron/santo`), env as any));
        break;
      case '0 9 * * *':
        ctx.waitUntil(handleArtigo(runWith(`${baseUrl}/api/cron/artigo?slot=1`), env as any));
        break;
      case '30 13 * * *':
        ctx.waitUntil(handleArtigo(runWith(`${baseUrl}/api/cron/artigo?slot=2`), env as any));
        break;
      case '0 18 * * *':
        ctx.waitUntil(handleArtigo(runWith(`${baseUrl}/api/cron/artigo?slot=3`), env as any));
        break;
      case '30 22 * * *':
        ctx.waitUntil(handleArtigo(runWith(`${baseUrl}/api/cron/artigo?slot=4`), env as any));
        break;
      default:
        console.warn(`[CF Scheduled] Cron nao mapeado: ${cron}`);
    }
  }
};
