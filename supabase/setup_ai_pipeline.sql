-- =====================================================================
-- ECLESIA BLOG CATÓLICO - CONFIGURAÇÃO DO PIPELINE DE IA (SQL CRON SETUP)
-- Agendamento Completo: 6 Artigos Diários + Liturgia da Palavra + Santoral
-- Projeto Supabase: https://sdyytxnmdquriqsxuvhd.supabase.co
-- =====================================================================

-- 1. EXTENSÕES OBRIGATÓRIAS
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. GARANTIR O BUCKET DE IMAGENS PÚBLICAS ("post-images") NO STORAGE
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

DROP POLICY IF EXISTS "post_images_public_select_ai" ON storage.objects;
CREATE POLICY "post_images_public_select_ai"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- 3. LIMPEZA DE AGENDAMENTOS ANTERIORES PARA EVITAR DUPLICIDADE
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT jobname FROM cron.job WHERE jobname LIKE 'eclesia-%') LOOP
    PERFORM cron.unschedule(r.jobname);
  END LOOP;
END $$;

-- =====================================================================
-- DISPARO 0: LITURGIA DIÁRIA DA PALAVRA ÀS 03:00 BRT (06:00 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-0-liturgia-3am',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-liturgia',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('status', 'publicado'),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 1: SANTO DO DIA (SANTORAL) ÀS 05:00 BRT (08:00 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-1-santo-5am',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('slot', 1, 'statusArtigo', 'publicado'),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 2: NOTÍCIA 1 - VATICANO & SANTA SÉ ÀS 07:30 BRT (10:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-2-noticia1-vaticano-7h30',
  '30 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('slot', 2, 'statusArtigo', 'publicado'),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 3: ESPIRITUALIDADE & DORES CONTEMPORÂNEAS 1 ÀS 10:30 BRT (13:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-3-espiritualidade1-10h30',
  '30 13 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('slot', 3, 'statusArtigo', 'publicado'),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 4: JUVENTUDE, VOCAÇÃO & FÉ DIGITAL ÀS 13:30 BRT (16:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-4-juventude-13h30',
  '30 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('slot', 4, 'statusArtigo', 'publicado'),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 5: NOTÍCIA 2 - IGREJA NO BRASIL & MISSÃO ÀS 16:30 BRT (19:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-5-noticia2-brasil-16h30',
  '30 19 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('slot', 5, 'statusArtigo', 'publicado'),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 6: ESPIRITUALIDADE & DORES CONTEMPORÂNEAS 2 ÀS 19:30 BRT (22:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-6-espiritualidade2-19h30',
  '30 22 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('slot', 6, 'statusArtigo', 'publicado'),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);

-- =====================================================================
-- 4. CONSULTA DE STATUS DOS AGENDAMENTOS ATIVOS
-- =====================================================================
SELECT jobid, schedule, command, active, jobname 
FROM cron.job 
WHERE jobname LIKE 'eclesia-%'
ORDER BY jobname;
