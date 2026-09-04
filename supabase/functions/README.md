# Guia de Configuração e Deploy: Supabase Edge Function com IA

Este guia orienta o deploy e a ativação da função **`gerar-artigo-diario`** no seu Supabase.

---

## 1. Configuração de Segredos no Supabase

As chaves de API necessárias já estão configuradas no seu arquivo [.env](file:///c:/Users/Maria%20Rodrigues/Documents/Blog%20_catolico/blog-catolico/.env). Para sincronizá-las nos Segredos de Edge Functions do Supabase, execute no terminal do projeto:

```bash
# Vincule ao seu projeto Supabase (ID: sdyytxnmdquriqsxuvhd)
npx supabase link --project-ref sdyytxnmdquriqsxuvhd

# Envie as chaves para as Edge Functions (ou configure via painel Supabase Secrets)
npx supabase secrets set GROK_API_KEY="SUA_CHAVE_GROK" GEMINI_API_KEY="SUA_CHAVE_GEMINI"
```

*(Ou adicione diretamente no painel web em: **Project Settings > Edge Functions > Secrets**)*.

---

## 2. Deploy da Edge Function

Para publicar a função na nuvem do Supabase:

```bash
npx supabase functions deploy gerar-artigo-diario --no-verify-jwt
```

---

## 3. Teste Manual (Via cURL / Terminal)

### Testar a Liturgia Diária:
```bash
curl -i --location --request POST 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario' \
  --header 'Content-Type: application/json' \
  --data '{"tipo": "liturgia", "statusArtigo": "publicado"}'
```

### Testar o Artigo de Tema em Alta (Radar de IA):
```bash
curl -i --location --request POST 'https://sdyytxnmdquriqsxuvhd.supabase.co/functions/v1/gerar-artigo-diario' \
  --header 'Content-Type: application/json' \
  --data '{"tipo": "tema_em_alta", "statusArtigo": "publicado"}'
```

---

## 4. Ativação dos Dois Agendamentos Diários (CRON)

1. Abra o painel do seu Supabase: [SQL Editor](https://supabase.com/dashboard/project/sdyytxnmdquriqsxuvhd/sql).
2. Abra e execute o script [supabase/setup_ai_pipeline.sql](file:///c:/Users/Maria%20Rodrigues/Documents/Blog%20_catolico/blog-catolico/supabase/setup_ai_pipeline.sql).
3. Os dois horários estratégicos (04:00 BRT e 11:30 BRT) estarão agendados automaticamente.
