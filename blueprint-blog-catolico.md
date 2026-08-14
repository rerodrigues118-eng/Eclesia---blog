# Blueprint — Blog Católico (Editorial + Loja + Assinaturas)

Inspiração: padrepauloricardo.org (autoridade editorial, seções de conteúdo espiritual, doação/assinatura) + bibliotecacatolica.com.br/blog (blog leve, categorias, newsletter).

---

## 1. Stack confirmada

| Camada | Ferramenta | Papel |
|---|---|---|
| Frontend/Vibecoding | Google Antigravity | Geração do código (Next.js recomendado) |
| Framework | Next.js (App Router) + Tailwind CSS | SSR/SEO, performance, páginas dinâmicas |
| Backend/DB/Auth | Supabase (Postgres + Auth + Storage + RLS) | Dados, login admin, upload de imagens |
| Automação de conteúdo | N8N (self-hosted, ex: seu VPS Hostinger) | Postagens diárias automáticas |
| E-mail | Brevo | Newsletter, cadastro por e-mail, campanhas |
| Pagamentos | Pagar.me (ou Stripe) | Assinaturas mensal/trimestral/anual + loja |
| IA para geração de conteúdo | Groq (Llama) / DeepSeek (já usados por você) | Redigir/curar artigos automáticos |

Essa combinação reaproveita 100% do seu ecossistema atual (Supabase, Brevo, N8N, Pagar.me) — não precisa aprender ferramenta nova, só orquestrar.

---

## 2. Design system

**Paleta**
- Branco puro `#FFFFFF` e off-white `#FAF8F2` (fundo)
- Dourado principal `#B8860B` (ouro velho) e dourado claro `#D4AF37` (destaques/hover)
- Preto suave/carvão `#1A1A1A` (texto principal)
- Cinza neutro `#6B6B6B` (texto secundário)
- Bordô discreto `#6E1E1E` (opcional, para tags litúrgicas — cor do tempo litúrgico)

**Tipografia**
- Títulos: serifada elegante — "Playfair Display" ou "Cormorant Garamond"
- Corpo: sans-serif legível — "Inter" ou "Lato"
- Números/datas (santoral, calendário): fonte monoespaçada leve, opcional

**Linguagem visual**
- Muito espaço em branco, grid limpo
- Filetes finos dourados como divisores (não usar dourado em bloco grande — usar como detalhe: bordas, ícones, linhas, iniciais capitulares)
- Cards com sombra suave e cantos levemente arredondados (4–8px, nada "app moderno" demais — manter sobriedade)
- Ícones de linha fina (outline), nunca emojis
- Imagens de santos/liturgia com moldura sutil dourada

---

## 3. Estrutura de páginas

- `/` — Home: Santo do Dia em destaque (hero), resumo da liturgia de hoje, oração do dia, últimos artigos, CTA newsletter, vitrine da loja
- `/santos` — Santoral completo, filtro por mês/dia, busca por nome
- `/santos/[slug]` — Página individual do santo (biografia, padroado, imagem, data)
- `/liturgia` — Liturgia diária completa (1ª leitura, salmo, 2ª leitura se houver, evangelho, cor litúrgica), navegação por data (calendário)
- `/artigos` — Blog (categorias: Espiritualidade, Doutrina, Notícias, Família, Santos)
- `/artigos/[slug]` — Artigo individual
- `/oracoes` — Orações por categoria/situação de vida (saúde, trabalho, família, luto, gratidão...), oração do dia em destaque
- `/oracoes/[slug]` — Oração individual
- `/loja` — Catálogo de artigos religiosos
- `/loja/[slug]` — Produto individual + checkout
- `/assinatura` — Planos mensal / trimestral / anual, comparação de benefícios
- `/admin/*` — Portal administrativo protegido (login Supabase Auth)

---

## 4. Schema do banco (Supabase / Postgres)

```sql
-- ROLES E PERFIS
create type user_role as enum ('admin', 'editor', 'assinante');

create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  role user_role default 'assinante',
  created_at timestamptz default now()
);

-- SANTOS (base própria, seedada 1x com ~365+ registros)
create table saints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  feast_month int not null,       -- 1-12
  feast_day int not null,         -- 1-31
  short_bio text not null,        -- usado no card de destaque
  full_bio text,                  -- página individual
  patronage text,                 -- padroeiro de quê
  category text,                  -- Mártir, Doutor da Igreja, Papa, Religiosa...
  image_url text,
  created_at timestamptz default now()
);
create index idx_saints_feast on saints (feast_month, feast_day);

-- LITURGIA DIÁRIA
create table daily_liturgy (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  liturgical_season text,         -- Advento, Natal, Quaresma, Páscoa, Tempo Comum
  liturgical_color text,          -- Verde, Roxo, Branco, Vermelho
  first_reading jsonb,            -- { referencia, texto }
  psalm jsonb,
  second_reading jsonb,           -- nullable, só domingos/solenidades
  gospel jsonb,
  source text,                    -- de onde veio (para atribuição/crédito)
  created_at timestamptz default now()
);

-- ORAÇÕES
create table prayers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  situation text not null,        -- Saúde, Trabalho, Família, Luto, Gratidão, Proteção...
  content text not null,
  is_featured_today boolean default false,
  featured_date date,
  created_at timestamptz default now()
);

-- ARTIGOS / NOTÍCIAS
create type article_status as enum ('rascunho', 'agendado', 'publicado');
create type article_source as enum ('manual', 'n8n');

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text,
  author_id uuid references profiles(id),
  status article_status default 'rascunho',
  source article_source default 'manual',
  published_at timestamptz,
  created_at timestamptz default now()
);

-- NEWSLETTER (cadastro por e-mail, sincroniza com Brevo)
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text default 'ativo',    -- ativo, cancelado
  brevo_contact_id text,
  created_at timestamptz default now()
);

-- LOJA
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price_cents int not null,
  images text[],
  stock int default 0,
  category text,
  active boolean default true,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  items jsonb not null,           -- [{product_id, qty, price_cents}]
  total_cents int not null,
  payment_status text default 'pendente',
  payment_provider_id text,       -- id da transação no Pagar.me/Stripe
  created_at timestamptz default now()
);

-- ASSINATURAS
create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,             -- Mensal, Trimestral, Anual
  price_cents int not null,
  interval text not null,         -- month, quarter, year
  benefits text[],
  provider_price_id text          -- id do plano no Pagar.me/Stripe
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  plan_id uuid references subscription_plans(id),
  status text default 'ativa',    -- ativa, cancelada, atrasada
  started_at timestamptz default now(),
  renews_at timestamptz,
  provider_subscription_id text
);
```

**RLS (Row Level Security) — regra geral**
- Leitura pública: `saints`, `daily_liturgy`, `prayers`, `articles` (só `status='publicado'`), `products` (`active=true`)
- Escrita: apenas `admin`/`editor` (via `profiles.role`)
- `subscribers`: insert público (form de newsletter), leitura restrita a admin
- `orders`/`subscriptions`: leitura restrita ao próprio usuário + admin

---

## 5. Fluxos de automação N8N

**5.1 Santo do Dia** — cron diário 00:05
1. Query em `saints` por `feast_month/feast_day` = hoje
2. Se houver mais de um santo no dia, definir regra de prioridade (ex: solenidade > memória obrigatória > facultativa — pode marcar manualmente um campo `priority`)
3. Atualiza um registro "destaque do dia" (tabela simples `daily_highlight` ou campo em cache) para a Home puxar sem query pesada

**5.2 Liturgia Diária** — cron diário 04:00 (antes do tráfego da manhã)
1. Scraping/consulta a uma API comunitária (ex: fork próprio do modelo API-Liturgia-CNBB) ou scraping direto com fallback
2. Parse do HTML/JSON → estrutura `first_reading`, `psalm`, `gospel`, etc.
3. Insere/atualiza `daily_liturgy` via Supabase REST API
4. **Nó de fallback**: se o scraping falhar, reenviar em 30 min; se falhar 3x, notificar você (Telegram/e-mail) para inserir manualmente
5. Guardar `source` para dar crédito (importante do ponto de vista de direitos autorais — leituras litúrgicas têm tradução oficial da CNBB)

**5.3 Oração do Dia** — cron diário 00:10
1. Seleciona em `prayers` a oração menos usada recentemente (`order by featured_date asc nulls first`)
2. Marca `is_featured_today = true`, `featured_date = hoje`, desmarca a do dia anterior

**5.4 Publicação automática de artigos**
1. Cron (ex: 1x/dia) ou gatilho de notícia relevante
2. Chamada à IA (Groq/DeepSeek, que você já usa no RankHire) com prompt de redator católico + tema do dia
3. Insere como `status='rascunho'` — **recomendo revisão humana antes de publicar** (conteúdo doutrinário exige cuidado editorial), ou `status='agendado'` se você confiar no pipeline depois de validado por semanas

**5.5 Newsletter diária/semanal (Brevo)**
1. Monta resumo automático: santo do dia + liturgia + oração + últimos artigos
2. Chama API do Brevo para disparar campanha para a lista segmentada de `subscribers`

**5.6 Webhook de pagamento (assinatura/loja)**
1. Recebe webhook do Pagar.me/Stripe
2. Atualiza `subscriptions`/`orders`
3. Dispara e-mail transacional via Brevo (confirmação, boas-vindas)

---

## 6. Roadmap de implementação (fases)

**Fase 1 — Fundação (Supabase + design)**
- Criar projeto Supabase, rodar o schema acima, configurar Auth e RLS
- Setar design tokens (cores, fontes) no Tailwind config
- Estrutura do projeto Next.js no Antigravity

**Fase 2 — Páginas públicas core**
- Home, Santos, Liturgia, Artigos, Orações com dados mockados/seed manual

**Fase 3 — Portal admin**
- Login admin/editor, CRUD de artigos, santos, orações, produtos
- Editor de texto rico para artigos (ex: Tiptap)

**Fase 4 — Loja + Assinaturas**
- Catálogo de produtos, carrinho, checkout Pagar.me/Stripe
- Planos de assinatura e área de assinante

**Fase 5 — Newsletter (Brevo)**
- Formulário de cadastro (Home, rodapé, dentro dos artigos)
- Sincronização de contato com Brevo + primeira campanha de teste

**Fase 6 — Automação N8N**
- Os 6 workflows da seção 5, em ambiente de teste antes de produção
- Monitoramento e alertas de falha

**Fase 7 — Polimento**
- SEO (metadata, sitemap, schema.org para artigos/receitas litúrgicas)
- Performance (imagens otimizadas, cache)
- Backup do Supabase, deploy final (Vercel recomendado para o Next.js)

---

## 7. Pontos de atenção

- **Direitos autorais da liturgia**: as traduções oficiais (CNBB) e textos bíblicos têm direitos reservados. Sempre dar crédito à fonte; para uso comercial pesado, vale checar com a CNBB sobre licenciamento.
- **Base de santos**: não existe API oficial gratuita — o caminho mais robusto é seedar sua própria tabela uma vez (via scraping cuidadoso ou digitação a partir de fontes públicas como martirológio romano) em vez de depender de terceiro no ar todos os dias.
- **Revisão editorial**: para conteúdo doutrinário, recomendo manter os artigos gerados por IA como rascunho até aprovação humana — evita erros doutrinários publicados automaticamente.
