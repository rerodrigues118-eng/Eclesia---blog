-- =====================================================================
-- ECLESIA BLOG CATÓLICO - CONFIGURAÇÃO DO PIPELINE DE IA (SQL CRON SETUP)
-- Agendamento Completo: 4 Artigos Diários + Liturgia da Palavra + Santoral
-- Execute este script no SQL Editor do Painel do seu Supabase
-- (https://supabase.com/dashboard/project/sdyytxnmdquriqsxuvhd/sql)
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
-- DISPARO 1: LITURGIA DIÁRIA DA PALAVRA ÀS 04:00 BRT (07:00 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-1-liturgia-4am',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('tipo', 'liturgia', 'statusArtigo', 'publicado'),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 2: SANTO DO DIA (SANTORAL) ÀS 05:00 BRT (08:00 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-2-santo-5am',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('tipo', 'santo', 'statusArtigo', 'publicado'),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 3: ARTIGO 1 - ESPIRITUALIDADE & ORAÇÃO MATINAL ÀS 06:00 BRT (09:00 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-3-artigo-slot1-6am',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('tipo', 'artigo_slot_1', 'statusArtigo', 'publicado'),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 4: ARTIGO 2 - TEOLOGIA, CATECISMO & SACRAMENTOS ÀS 10:30 BRT (13:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-4-artigo-slot2-10h30',
  '30 13 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('tipo', 'artigo_slot_2', 'statusArtigo', 'publicado'),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 5: ARTIGO 3 - APOLOGÉTICA, JUVENTUDE & MORAL ÀS 15:00 BRT (18:00 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-5-artigo-slot3-15h',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('tipo', 'artigo_slot_3', 'statusArtigo', 'publicado'),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);

-- =====================================================================
-- DISPARO 6: ARTIGO 4 - VATICANO, ATUALIDADES & TEMAS EM ALTA ÀS 19:30 BRT (22:30 UTC)
-- =====================================================================
SELECT cron.schedule(
  'eclesia-6-artigo-slot4-19h30',
  '30 22 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', coalesce(current_setting('app.settings.service_role_key', true), 'SEU_SERVICE_ROLE_KEY'))
    ),
    body := jsonb_build_object('tipo', 'artigo_slot_4', 'statusArtigo', 'publicado'),
    timeout_milliseconds := 60000
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
