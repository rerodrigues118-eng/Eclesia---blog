-- ================================================================
-- ECLESIA — Schema v1.0 (Blog + Loja + Assinaturas)
-- Rodar no Supabase SQL Editor em ordem
-- ================================================================

-- ============================================================
-- PERFIS E AUTENTICAÇÃO
-- ============================================================
create type user_role as enum ('admin', 'editor', 'assinante');

create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  role user_role default 'assinante',
  avatar_url text,
  created_at timestamptz default now()
);

-- Trigger: cria profile automaticamente ao criar usuário Auth
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- SANTOS
-- ============================================================
create table saints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  title text,
  feast_month int not null check (feast_month between 1 and 12),
  feast_day int not null check (feast_day between 1 and 31),
  short_bio text not null,
  full_bio text,
  patronage text,
  category text,
  image_url text,
  prayer text,
  quotes text[],
  featured boolean default false,
  created_at timestamptz default now()
);

create index idx_saints_feast on saints (feast_month, feast_day);
create index idx_saints_slug on saints (slug);
create index idx_saints_featured on saints (featured) where featured = true;

-- ============================================================
-- LITURGIA DIÁRIA
-- ============================================================
create table daily_liturgy (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  liturgical_season text,
  liturgical_color text,
  color_hex text,
  full_date_str text,
  first_reading jsonb,
  psalm jsonb,
  second_reading jsonb,
  gospel jsonb,
  source text,
  inserted_manually boolean default false,
  created_at timestamptz default now()
);

create index idx_liturgy_date on daily_liturgy (date desc);

-- ============================================================
-- ORAÇÕES
-- ============================================================
create table prayers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  situation text not null,
  content text not null,
  is_featured_today boolean default false,
  featured_date date,
  created_at timestamptz default now()
);

create index idx_prayers_situation on prayers (situation);
create index idx_prayers_featured on prayers (is_featured_today) where is_featured_today = true;
create index idx_prayers_slug on prayers (slug);

-- ============================================================
-- ARTIGOS / NOTÍCIAS
-- ============================================================
create type article_status as enum ('rascunho', 'agendado', 'publicado');
create type article_source as enum ('manual', 'n8n_ia');
create type article_type as enum ('artigo', 'noticia');

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text,
  type article_type default 'artigo',
  author_id uuid references profiles(id),
  status article_status default 'rascunho',
  source article_source default 'manual',
  featured boolean default false,
  trending boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

create index idx_articles_status on articles (status, published_at desc);
create index idx_articles_slug on articles (slug);
create index idx_articles_category on articles (category);
create index idx_articles_featured on articles (featured) where featured = true;

-- ============================================================
-- NEWSLETTER
-- ============================================================
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null constraint subscribers_email_format_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  name text,
  status text default 'ativo',
  brevo_contact_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- LOJA
-- ============================================================
create type product_category as enum ('livro', 'sacramental', 'arte', 'vestuario');

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  subtitle text,
  description text,
  price_cents int not null,
  images text[],
  stock int default 0,
  category product_category,
  active boolean default true,
  created_at timestamptz default now()
);

create index idx_products_category on products (category);
create index idx_products_active on products (active) where active = true;

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name text,
  items jsonb not null,
  total_cents int not null,
  payment_status text default 'pendente',
  payment_method text,
  pagarme_order_id text,
  shipping_address jsonb,
  created_at timestamptz default now()
);

create index idx_orders_email on orders (customer_email);
create index idx_orders_status on orders (payment_status);

-- ============================================================
-- ASSINATURAS
-- ============================================================
create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  price_cents int not null,
  interval text not null,
  interval_count int default 1,
  benefits text[],
  pagarme_plan_id text,
  active boolean default true
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  plan_id uuid references subscription_plans(id),
  status text default 'ativa',
  started_at timestamptz default now(),
  renews_at timestamptz,
  canceled_at timestamptz,
  pagarme_subscription_id text
);

create index idx_subscriptions_user on subscriptions (user_id);
create index idx_subscriptions_status on subscriptions (status);

-- ================================================================
-- RLS (Row Level Security) & Security Definer Functions
-- ================================================================

create or replace function public.is_admin_or_editor()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ) or coalesce(auth.jwt()->>'email', '') = 'suporte.delski@gmail.com';
$$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) or coalesce(auth.jwt()->>'email', '') = 'suporte.delski@gmail.com';
$$;

alter table saints enable row level security;
create policy "saints_public_read" on saints for select using (true);
create policy "saints_admin_write" on saints for all
  using (public.is_admin_or_editor());

alter table daily_liturgy enable row level security;
create policy "liturgy_public_read" on daily_liturgy for select using (true);
create policy "liturgy_admin_write" on daily_liturgy for all
  using (public.is_admin_or_editor());

alter table prayers enable row level security;
create policy "prayers_public_read" on prayers for select using (true);
create policy "prayers_admin_write" on prayers for all
  using (public.is_admin_or_editor());

alter table articles enable row level security;
create policy "articles_public_read" on articles for select
  using (status = 'publicado' or public.is_admin_or_editor());
create policy "articles_admin_all" on articles for all
  using (public.is_admin_or_editor());

alter table subscribers enable row level security;
create policy "subscribers_public_insert" on subscribers for insert with check (true);
create policy "subscribers_admin_read" on subscribers for select
  using (public.is_admin());

alter table products enable row level security;
create policy "products_public_read" on products for select using (active = true or public.is_admin());
create policy "products_admin_write" on products for all
  using (public.is_admin());

alter table orders enable row level security;
create policy "orders_public_insert" on orders for insert with check (true);
create policy "orders_user_read" on orders for select
  using (customer_email = auth.email() or public.is_admin());
create policy "orders_admin_update" on orders for update
  using (public.is_admin());

alter table subscription_plans enable row level security;
create policy "plans_public_read" on subscription_plans for select using (active = true or public.is_admin());
create policy "plans_admin_write" on subscription_plans for all
  using (public.is_admin());

alter table subscriptions enable row level security;
create policy "subscriptions_user_read" on subscriptions for select
  using (user_id = auth.uid() or public.is_admin());
create policy "subscriptions_user_insert" on subscriptions for insert
  with check (user_id = auth.uid());
create policy "subscriptions_admin_update" on subscriptions for update
  using (public.is_admin());

alter table profiles enable row level security;
create policy "profiles_public_read_authors" on profiles for select
  using (true);
create policy "profiles_self_update" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
create policy "profiles_admin_all" on profiles for all
  using (public.is_admin());

-- ============================================================
-- SITE SETTINGS & CMS GLOBAL
-- ============================================================
create table if not exists public.site_settings (
  id text primary key default 'default',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;
create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_admin_write" on public.site_settings for all using (public.is_admin());

