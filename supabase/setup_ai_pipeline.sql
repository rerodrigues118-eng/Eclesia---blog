-- =====================================================================
-- ECLESIA BLOG CATÓLICO - CONFIGURAÇÃO DO PIPELINE DE IA (SQL SETUP)
-- Execute este script no SQL Editor do Painel do seu Supabase
-- (https://supabase.com/dashboard/project/_/sql)
-- =====================================================================

-- 1. EXTENSÕES OBRIGATÓRIAS PARA AGENDAMENTO AUTOMÁTICO (CRON)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. GARANTIR O BUCKET DE IMAGENS PÚBLICAS ("post-images")
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Política para leitura pública irrestrita das capas de artigos
DROP POLICY IF EXISTS "post_images_public_select_ai" ON storage.objects;
CREATE POLICY "post_images_public_select_ai"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- 3. AGENDAMENTO DOS 2 DISPAROS DIÁRIOS ESTRATÉGICOS NO PG_CRON
-- Nota: O horário do pg_cron roda em UTC.
-- Brasília (BRT) = UTC - 3h
-- 04:00 BRT = 07:00 UTC
-- 11:30 BRT = 14:30 UTC

-- Limpa agendamentos anteriores caso já existam para evitar duplicidade
SELECT cron.unschedule('eclesia-liturgia-diaria-4am') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'eclesia-liturgia-diaria-4am'
);

SELECT cron.unschedule('eclesia-tema-em-alta-11am') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'eclesia-tema-em-alta-11am'
);

-- =====================================================================
-- DISPARO 1: LITURGIA DIÁRIA ÀS 04:00 BRT (07:00 UTC)
-- Leituras da Santa Missa, Evangelho proclamado e Homilia matinal
-- =====================================================================
SELECT cron.schedule(
  'eclesia-liturgia-diaria-4am',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT concat(coalesce(current_setting('app.settings.supabase_url', true), 'https://sdyytxnmdquriqsxuvhd.supabase.co'), '/functions/v1/gerar-artigo-diario')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY_AQUI'))
    ),
    body := jsonb_build_object(
      'tipo', 'liturgia',
      'statusArtigo', 'publicado'
    ),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 2: TEMA EM ALTA ESCOLHIDO PELA IA ÀS 11:30 BRT (14:30 UTC)
-- Radar de tendências católicas do dia, selo trending = true
-- =====================================================================
SELECT cron.schedule(
  'eclesia-tema-em-alta-11am',
  '30 14 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT concat(coalesce(current_setting('app.settings.supabase_url', true), 'https://sdyytxnmdquriqsxuvhd.supabase.co'), '/functions/v1/gerar-artigo-diario')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY_AQUI'))
    ),
    body := jsonb_build_object(
      'tipo', 'tema_em_alta',
      'statusArtigo', 'publicado'
    ),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- 4. CONSULTA DE STATUS DOS AGENDAMENTOS
-- Execute para conferir se ambos os crons estão ativos:
-- =====================================================================
SELECT jobid, schedule, command, nodename, nodeport, database, username, active, jobname 
FROM cron.job 
WHERE jobname LIKE 'eclesia-%';
